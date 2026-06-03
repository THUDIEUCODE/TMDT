import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearPendingCombo, getPendingCombo, markComboOrdered } from '../../services/comboService'
import { createOrder } from '../../services/orderService'
import { getCurrentUserId } from '../../utils/authStorage'
import { getImageUrl, handleImageError, isImageValue } from '../../utils/imageUtils'

const checkoutStorageKey = 'checkoutData'
const latestOrderStorageKey = 'latestOrder'
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const getImageFallback = (value, fallback = 'SP') => String(value || fallback).slice(0, 2).toUpperCase()
const paymentMethods = [
  { id: 'COD', label: 'Thanh toán khi nhận hàng COD' },
  { id: 'chuyenKhoan', label: 'Chuyển khoản ngân hàng' },
  { id: 'vi', label: 'Ví điện tử' },
]

const getStoredCheckout = () => {
  try {
    return JSON.parse(localStorage.getItem(checkoutStorageKey))
  } catch {
    return null
  }
}

function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const checkoutData = useMemo(
    () => location.state?.checkoutData || getStoredCheckout(),
    [location.state],
  )
  const pendingCombo = getPendingCombo()
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderWarning, setOrderWarning] = useState('')

  useEffect(() => {
    if (!checkoutData) {
      navigate('/checkout', { replace: true })
    }
  }, [checkoutData, navigate])

  if (!checkoutData) {
    return null
  }

  const submitOrder = async () => {
    setOrderError('')
    setOrderWarning('')

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)
        return
      }

      setIsSubmitting(true)
      const baseNote = checkoutData.ghiChuGiaoHang || ''
      const comboNote = pendingCombo.id
        ? `Đặt từ combo: ${pendingCombo.name}. Lời nhắn: ${pendingCombo.message}. ${baseNote}`.trim()
        : baseNote
      const order = await createOrder({
        maNguoiDung,
        hoTenNguoiNhan: checkoutData.hoTenNguoiNhan,
        soDienThoaiNguoiNhan: checkoutData.soDienThoaiNguoiNhan,
        diaChiGiaoHang: checkoutData.diaChiGiaoHang,
        quanHuyen: checkoutData.quanHuyen,
        tinhThanhGiaoHang: checkoutData.tinhThanhGiaoHang,
        ghiChuGiaoHang: comboNote,
        phuongThucThanhToan: paymentMethod,
        maVoucher: checkoutData.maVoucher,
        phiVanChuyen: checkoutData.phiVanChuyen,
        ghiChu: comboNote,
      })

      if (pendingCombo.id) {
        try {
          await markComboOrdered(pendingCombo.id)
        } catch (error) {
          setOrderWarning(error?.message || 'Đơn hàng đã tạo, nhưng chưa cập nhật được trạng thái combo.')
        }
        clearPendingCombo()
      }

      const orderWithVoucher = {
        ...order,
        voucherCode: order.voucherCode || checkoutData.voucherCode || '',
        maCodeVoucher: order.maCodeVoucher || checkoutData.voucherCode || '',
      }

      localStorage.setItem(latestOrderStorageKey, JSON.stringify(orderWithVoucher))
      localStorage.removeItem(checkoutStorageKey)

      const orderId = orderWithVoucher.code || orderWithVoucher.id
      navigate(`/order-success?orderId=${encodeURIComponent(orderId)}`, { state: { order: orderWithVoucher } })
    } catch (error) {
      setOrderError(
        error?.message ||
          'Không thể tạo đơn hàng vì chưa kết nối được backend.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span>›</span>
        <Link to="/checkout">Thông tin giao hàng</Link>
        <span>›</span>
        <strong>Thanh toán</strong>
      </nav>

      <section className="checkout-hero">
        <span>Bước 2</span>
        <h1>Thanh toán</h1>
        <p>Chọn phương thức thanh toán phù hợp để hoàn tất đơn hàng.</p>
      </section>

      <section className="checkout-layout">
        <div className="checkout-form-panel">
          <h2>Thông tin người nhận</h2>
          <div className="recipient-summary">
            <div>
              <span>Người nhận</span>
              <strong>{checkoutData.hoTenNguoiNhan}</strong>
            </div>
            <div>
              <span>Số điện thoại</span>
              <strong>{checkoutData.soDienThoaiNguoiNhan}</strong>
            </div>
            <div>
              <span>Địa chỉ</span>
              <strong>
                {[checkoutData.diaChiGiaoHang, checkoutData.quanHuyen, checkoutData.tinhThanhGiaoHang]
                  .filter(Boolean)
                  .join(', ')}
              </strong>
            </div>
          </div>

          <h2>Phương thức thanh toán</h2>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <label className={paymentMethod === method.id ? 'active' : ''} key={method.id}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>

          {paymentMethod === 'chuyenKhoan' && (
            <div className="payment-note">
              <h3>Thông tin chuyển khoản mẫu</h3>
              <p>Ngân hàng: Demo Bank</p>
              <p>Số tài khoản: 0123456789</p>
              <p>Chủ tài khoản: DAC SAN MIEN TRUNG</p>
              <p>Nội dung chuyển khoản sẽ hiển thị sau khi tạo đơn.</p>
            </div>
          )}

          {paymentMethod === 'COD' && (
            <div className="payment-note">
              <h3>Thanh toán khi nhận hàng</h3>
              <p>Bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng sau khi kiểm tra đơn.</p>
            </div>
          )}

          {paymentMethod === 'vi' && (
            <div className="payment-note">
              <h3>Ví điện tử</h3>
              <p>Sau khi tạo đơn, bạn sẽ xác nhận thanh toán ví demo ở trang đặt hàng thành công.</p>
            </div>
          )}
        </div>

        <aside className="checkout-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-mini-items">
            {(checkoutData.items || []).map((item) => (
              <div key={item.id}>
                <span>
                  {isImageValue(item.image) ? (
                    <img src={getImageUrl(item.image)} alt={item.name} onError={handleImageError} />
                  ) : (
                    getImageFallback(item.image, item.name)
                  )}
                </span>
                <p>
                  <strong>{item.name}</strong>
                  <small>{item.variantName || item.variantLabel} x {item.quantity}</small>
                </p>
                <b>{formatCurrency(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="summary-lines">
            <div>
              <span>Tổng tiền hàng</span>
              <strong>{formatCurrency(checkoutData.tongTienHang)}</strong>
            </div>
            <div>
              <span>Giảm giá</span>
              <strong>-{formatCurrency(checkoutData.tienGiam)}</strong>
            </div>
            {checkoutData.maVoucher ? (
              <div>
                <span>Voucher</span>
                <strong>{checkoutData.voucherCode || checkoutData.maVoucher}</strong>
              </div>
            ) : null}
            <div>
              <span>Phí vận chuyển</span>
              <strong>{formatCurrency(checkoutData.phiVanChuyen)}</strong>
            </div>
            <div className="summary-total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(checkoutData.tongThanhToan)}</strong>
            </div>
          </div>

          {orderError ? <p className="form-error">{orderError}</p> : null}
          {orderWarning ? <p className="form-success">{orderWarning}</p> : null}

          <div className="payment-actions">
            <Link className="button secondary" to="/checkout">
              Quay lại
            </Link>
            <button className="button" type="button" onClick={submitOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
            </button>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PaymentPage
