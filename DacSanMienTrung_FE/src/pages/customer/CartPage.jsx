import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mockCartItems } from '../../data/mockCart'
import {
  clearCart,
  deleteCartItem,
  getCart,
  mapCartItemFromApi,
  updateCartItem,
} from '../../services/cartService'
import { applyVoucher } from '../../services/voucherService'
import { getCurrentUserId } from '../../utils/authStorage'
import './CartPage.css'

const shippingFee = 25000
const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`
const fallbackCartItems = mockCartItems.map(mapCartItemFromApi)
const checkoutStorageKey = 'checkoutData'
const pendingVoucherStorageKey = 'dacsan_pending_voucher_code'

const getVoucherDiscount = (payload, maCode, tongTienHang) => {
  const voucher = payload?.data ?? payload ?? {}
  const tienGiam = Number(voucher.tienGiam ?? voucher.discountAmount ?? voucher.soTienGiam ?? 0)

  return {
    maVoucher: voucher.maVoucher ?? voucher.id ?? voucher.voucherId ?? null,
    maCode: voucher.maCode ?? maCode,
    tienGiam,
    tongSauGiam: Number(voucher.tongSauGiam ?? voucher.totalAfterDiscount ?? Math.max(tongTienHang - tienGiam, 0)),
    tongTienHang,
    message: voucher.message ?? 'Đã áp dụng mã voucher.',
  }
}

function CartPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState(fallbackCartItems)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [pendingItemId, setPendingItemId] = useState('')

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const discount = appliedVoucher ? appliedVoucher.tienGiam : 0
  const total = Math.max(subtotal - discount + shippingFee, 0)

  const loadCart = useCallback(async ({ silent = false } = {}) => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
      return
    }

    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiItems = await getCart(maNguoiDung)
      setItems(apiItems)
      setHasApiError(false)
    } catch {
      setItems(fallbackCartItems)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadCart()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [loadCart])

  useEffect(() => {
    const pendingVoucherCode = localStorage.getItem(pendingVoucherStorageKey)

    if (pendingVoucherCode) {
      setVoucherCode(pendingVoucherCode)
      localStorage.removeItem(pendingVoucherStorageKey)
    }
  }, [])

  const updateFallbackQuantity = (itemId, nextQuantity) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.min(Math.max(nextQuantity, 1), item.stock || nextQuantity) }
          : item,
      ),
    )
  }

  const removeFallbackItem = (itemId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = async (item, nextQuantity) => {
    setCartError('')
    setCartMessage('')

    if (nextQuantity < 1) {
      const shouldDelete = window.confirm('Số lượng đang là 1. Bạn muốn xóa sản phẩm này khỏi giỏ hàng?')

      if (shouldDelete) {
        await removeItem(item)
      }

      return
    }

    if (item.stock > 0 && nextQuantity > item.stock) {
      setCartError('Số lượng vượt quá tồn kho.')
      return
    }

    if (!item.cartItemId || hasApiError) {
      updateFallbackQuantity(item.id, nextQuantity)
      return
    }

    try {
      setPendingItemId(item.id)
      await updateCartItem(item.cartItemId, { soLuong: nextQuantity })
      await loadCart({ silent: true })
    } catch (error) {
      setCartError(error?.message || 'Không thể cập nhật giỏ hàng.')
    } finally {
      setPendingItemId('')
    }
  }

  const removeItem = async (item) => {
    setCartError('')
    setCartMessage('')

    if (!item.cartItemId || hasApiError) {
      removeFallbackItem(item.id)
      return
    }

    try {
      setPendingItemId(item.id)
      await deleteCartItem(item.cartItemId)
      await loadCart({ silent: true })
    } catch (error) {
      setCartError(error?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng.')
    } finally {
      setPendingItemId('')
    }
  }

  const clearAllItems = async () => {
    setCartError('')
    setCartMessage('')

    if (items.length === 0) {
      return
    }

    const shouldClear = window.confirm('Bạn muốn xóa toàn bộ giỏ hàng?')

    if (!shouldClear) {
      return
    }

    if (hasApiError) {
      setItems([])
      return
    }

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
        return
      }

      setPendingItemId('all')
      await clearCart(maNguoiDung)
      await loadCart({ silent: true })
      setCartMessage('Đã xóa toàn bộ giỏ hàng.')
    } catch (error) {
      setCartError(error?.message || 'Không thể xóa toàn bộ giỏ hàng.')
    } finally {
      setPendingItemId('')
    }
  }

  const handleApplyVoucher = async () => {
    const maCode = voucherCode.trim().toUpperCase()
    setCartError('')
    setCartMessage('')

    if (!maCode) {
      setCartError('Vui lòng nhập mã voucher.')
      return
    }

    try {
      setIsApplyingVoucher(true)
      const payload = await applyVoucher({ maCode, tongTienHang: subtotal })
      const voucher = getVoucherDiscount(payload, maCode, subtotal)
      setAppliedVoucher(voucher)
      setVoucherCode(voucher.maCode)
      setCartMessage(voucher.message)
    } catch (error) {
      setAppliedVoucher(null)
      setCartError(error?.message || 'Voucher không hợp lệ hoặc chưa thể áp dụng.')
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const removeVoucher = () => {
    setAppliedVoucher(null)
    setCartMessage('Đã bỏ voucher.')
  }

  const proceedToCheckout = () => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
      return
    }

    const checkoutData = {
      maNguoiDung,
      maVoucher: appliedVoucher?.maVoucher ?? null,
      voucherCode: appliedVoucher?.maCode ?? '',
      tienGiam: discount,
      phiVanChuyen: shippingFee,
      tongTienHang: subtotal,
      tongThanhToan: total,
      items,
    }

    localStorage.setItem(checkoutStorageKey, JSON.stringify(checkoutData))
    navigate('/checkout', { state: { checkoutData } })
  }

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <span>Giỏ hàng</span>
        <h1>Giỏ hàng của bạn</h1>
        <p>Kiểm tra sản phẩm, số lượng và áp dụng ưu đãi trước khi đặt hàng.</p>
      </section>

      {isLoading ? <p className="product-result-summary">Đang tải giỏ hàng...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}
      {cartError ? <p className="form-error">{cartError}</p> : null}
      {cartMessage ? <p className="form-success">{cartMessage}</p> : null}

      {items.length > 0 ? (
        <section className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-toolbar">
              <p>
                <strong>{itemCount}</strong> sản phẩm trong giỏ
              </p>
              <button type="button" onClick={clearAllItems} disabled={pendingItemId === 'all'}>
                Xóa toàn bộ
              </button>
            </div>

            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <span>{item.image}</span>
                </div>

                <div className="cart-item-info">
                  <h2>{item.name}</h2>
                  <p>{item.province || 'Đang cập nhật xuất xứ'}</p>
                  <span>{item.variantName || item.variantLabel}</span>
                  {item.stock > 0 ? <small>Còn {item.stock} sản phẩm</small> : null}
                </div>

                <div className="cart-item-price">
                  <small>Đơn giá</small>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>

                <div className="quantity-control cart-quantity">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    disabled={pendingItemId === item.id}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    disabled={pendingItemId === item.id || (item.stock > 0 && item.quantity >= item.stock)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <small>Thành tiền</small>
                  <strong>{formatCurrency(item.total || item.price * item.quantity)}</strong>
                </div>

                <button
                  className="cart-remove"
                  type="button"
                  onClick={() => removeItem(item)}
                  disabled={pendingItemId === item.id}
                >
                  Xóa
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary-panel">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="voucher-box">
              <label htmlFor="voucher">Mã voucher</label>
              <div>
                <input
                  id="voucher"
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value)}
                  placeholder="Nhập mã ưu đãi"
                />
                <button type="button" onClick={handleApplyVoucher} disabled={isApplyingVoucher}>
                  Áp dụng
                </button>
              </div>
              {appliedVoucher ? (
                <p>
                  Đã áp dụng mã {appliedVoucher.maCode}.{' '}
                  <button className="voucher-remove-button" type="button" onClick={removeVoucher}>
                    Bỏ voucher
                  </button>
                </p>
              ) : null}
            </div>

            <div className="summary-lines">
              <div>
                <span>Tổng số lượng</span>
                <strong>{itemCount}</strong>
              </div>
              <div>
                <span>Tổng tiền hàng</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span>Giảm giá</span>
                <strong>-{formatCurrency(discount)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển tạm tính</span>
                <strong>{formatCurrency(shippingFee)}</strong>
              </div>
              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            <button className="button cart-checkout-button" type="button" onClick={proceedToCheckout}>
              Tiến hành đặt hàng
            </button>
          </aside>
        </section>
      ) : (
        <section className="empty-products">
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn vài món đặc sản miền Trung trước khi đặt hàng.</p>
          <Link className="button" to="/categories">
            Xem danh mục
          </Link>
        </section>
      )}
    </div>
  )
}

export default CartPage
