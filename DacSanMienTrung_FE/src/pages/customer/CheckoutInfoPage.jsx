import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mockCartItems } from '../../data/mockCart'
import { getUserById } from '../../services/authService'
import { getCart, mapCartItemFromApi } from '../../services/cartService'
import { getPendingCombo } from '../../services/comboService'
import { getCurrentUser, getCurrentUserId, normalizeUser } from '../../utils/authStorage'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const checkoutStorageKey = 'checkoutData'
const shippingMethods = {
  standard: { label: 'Giao hàng tiêu chuẩn', fee: 25000, description: 'Nhận hàng trong 3-5 ngày.' },
  express: { label: 'Giao hàng nhanh', fee: 45000, description: 'Nhận hàng trong 1-2 ngày.' },
}
const fallbackCartItems = mockCartItems.map(mapCartItemFromApi)
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const getStoredCheckout = () => {
  try {
    return JSON.parse(localStorage.getItem(checkoutStorageKey))
  } catch {
    return null
  }
}

function CheckoutInfoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const storedCheckoutData = location.state?.checkoutData || getStoredCheckout()
  const pendingCombo = getPendingCombo()
  const [items, setItems] = useState(fallbackCartItems)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const [appliedVoucher] = useState({
    maVoucher: storedCheckoutData?.maVoucher ?? null,
    maCode: storedCheckoutData?.voucherCode ?? '',
    tienGiam: Number(storedCheckoutData?.tienGiam ?? 0),
  })
  const [formData, setFormData] = useState({
    hoTenNguoiNhan: '',
    soDienThoaiNguoiNhan: '',
    diaChiGiaoHang: '',
    quanHuyen: '',
    tinhThanhGiaoHang: '',
    ghiChuGiaoHang: '',
  })

  const fillDefaultAddress = (user) => {
    const normalizedUser = normalizeUser(user)
    const defaultAddress = normalizedUser.diaChi || normalizedUser.address || ''

    if (!defaultAddress) {
      return
    }

    setFormData((current) => {
      if (current.diaChiGiaoHang.trim()) {
        return current
      }

      return {
        ...current,
        diaChiGiaoHang: defaultAddress,
      }
    })
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
        return
      }

      fillDefaultAddress(getCurrentUser())

      try {
        const [apiItems, apiUser] = await Promise.all([
          getCart(maNguoiDung),
          getUserById(maNguoiDung).catch(() => null),
        ])
        setItems(apiItems)
        if (apiUser) {
          fillDefaultAddress(apiUser)
        }
        setHasApiError(false)
      } catch {
        setItems(fallbackCartItems)
        setHasApiError(true)
      } finally {
        setIsLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [location.pathname, location.search, navigate])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const shippingFee = shippingMethods[shippingMethod].fee
  const discount = appliedVoucher.tienGiam || 0
  const total = Math.max(subtotal - discount + shippingFee, 0)

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.hoTenNguoiNhan.trim()) {
      nextErrors.hoTenNguoiNhan = 'Vui lòng nhập họ tên người nhận.'
    }

    if (!formData.soDienThoaiNguoiNhan.trim()) {
      nextErrors.soDienThoaiNguoiNhan = 'Vui lòng nhập số điện thoại.'
    }

    if (!formData.diaChiGiaoHang.trim()) {
      nextErrors.diaChiGiaoHang = 'Vui lòng nhập địa chỉ giao hàng.'
    }

    if (!formData.tinhThanhGiaoHang.trim()) {
      nextErrors.tinhThanhGiaoHang = 'Vui lòng nhập tỉnh/thành.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitCheckout = (event) => {
    event.preventDefault()

    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
      return
    }

    if (!validateForm()) {
      return
    }

    const checkoutData = {
      maNguoiDung,
      ...formData,
      maVoucher: appliedVoucher.maVoucher,
      voucherCode: appliedVoucher.maCode,
      tienGiam: discount,
      phiVanChuyen: shippingFee,
      tongTienHang: subtotal,
      tongThanhToan: total,
      items,
    }

    localStorage.setItem(checkoutStorageKey, JSON.stringify(checkoutData))
    navigate('/payment', { state: { checkoutData } })
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="checkout-page">
        <section className="empty-products">
          <h2>Giỏ hàng của bạn đang trống.</h2>
          <p>Vui lòng quay lại giỏ hàng trước khi tiến hành đặt hàng.</p>
          <Link className="button" to="/cart">
            Quay lại giỏ hàng
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span>›</span>
        <strong>Thông tin giao hàng</strong>
      </nav>

      <section className="checkout-hero">
        <span>Bước 1</span>
        <h1>Thông tin giao hàng</h1>
        <p>Nhập thông tin người nhận để cửa hàng chuẩn bị đơn đặc sản miền Trung cho bạn.</p>
      </section>

      {isLoading ? <p className="product-result-summary">Đang tải giỏ hàng...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

      {pendingCombo.id ? (
        <section className="voucher-box">
          <label>Bạn đang đặt combo: {pendingCombo.name}</label>
          {pendingCombo.message ? <p>Lời nhắn: {pendingCombo.message}</p> : null}
        </section>
      ) : null}

      <form className="checkout-layout" onSubmit={submitCheckout}>
        <div className="checkout-form-panel">
          <h2>Người nhận</h2>
          <div className="checkout-form-grid">
            <label>
              Họ tên người nhận
              <input
                value={formData.hoTenNguoiNhan}
                onChange={(event) => updateField('hoTenNguoiNhan', event.target.value)}
                placeholder="Nhập họ tên"
              />
              {errors.hoTenNguoiNhan && <small>{errors.hoTenNguoiNhan}</small>}
            </label>
            <label>
              Số điện thoại
              <input
                value={formData.soDienThoaiNguoiNhan}
                onChange={(event) => updateField('soDienThoaiNguoiNhan', event.target.value)}
                placeholder="0900000000"
              />
              {errors.soDienThoaiNguoiNhan && <small>{errors.soDienThoaiNguoiNhan}</small>}
            </label>
            <label>
              Tỉnh/thành
              <input
                value={formData.tinhThanhGiaoHang}
                onChange={(event) => updateField('tinhThanhGiaoHang', event.target.value)}
                placeholder="Đà Nẵng"
              />
              {errors.tinhThanhGiaoHang && <small>{errors.tinhThanhGiaoHang}</small>}
            </label>
            <label>
              Quận/huyện
              <input
                value={formData.quanHuyen}
                onChange={(event) => updateField('quanHuyen', event.target.value)}
                placeholder="Hải Châu"
              />
            </label>
            <label className="checkout-full">
              Địa chỉ giao hàng
              <input
                value={formData.diaChiGiaoHang}
                onChange={(event) => updateField('diaChiGiaoHang', event.target.value)}
                placeholder="Số nhà, tên đường, phường/xã"
              />
              {errors.diaChiGiaoHang && <small>{errors.diaChiGiaoHang}</small>}
            </label>
            <label className="checkout-full">
              Ghi chú giao hàng
              <textarea
                rows="4"
                value={formData.ghiChuGiaoHang}
                onChange={(event) => updateField('ghiChuGiaoHang', event.target.value)}
                placeholder="Ghi chú thêm cho người giao hàng"
              />
            </label>
          </div>

          <h2>Phương thức giao hàng</h2>
          <div className="shipping-methods">
            {Object.entries(shippingMethods).map(([key, method]) => (
              <label className={shippingMethod === key ? 'active' : ''} key={key}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === key}
                  onChange={() => setShippingMethod(key)}
                />
                <span>
                  <strong>{method.label}</strong>
                  <small>{method.description}</small>
                </span>
                <b>{formatCurrency(method.fee)}</b>
              </label>
            ))}
          </div>
        </div>

        <aside className="checkout-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-mini-items">
            {items.map((item) => (
              <div key={item.id}>
                <span>
                  <img src={getImageUrl(item.hinhAnh || item.image)} alt={item.name} onError={handleImageError} />
                </span>
                <p>
                  <strong>{item.name}</strong>
                  <small>{item.variantName || item.variantLabel} x {item.quantity}</small>
                </p>
                <b>{formatCurrency(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>

          {appliedVoucher.maVoucher ? (
            <div className="voucher-box">
              <label>Voucher đã áp dụng</label>
              <p>
                Mã {appliedVoucher.maCode || appliedVoucher.maVoucher} đã được áp dụng. Muốn đổi voucher,
                vui lòng quay lại giỏ hàng.
              </p>
            </div>
          ) : null}

          <div className="summary-lines">
            <div>
              <span>Tổng tiền hàng</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Giảm giá</span>
              <strong>-{formatCurrency(discount)}</strong>
            </div>
            <div>
              <span>Phí vận chuyển</span>
              <strong>{formatCurrency(shippingFee)}</strong>
            </div>
            <div className="summary-total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
          <button className="button checkout-submit" type="submit">
            Tiếp tục thanh toán
          </button>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutInfoPage
