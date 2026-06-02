import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  confirmWalletPayment,
  getOrderById,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from '../../services/orderService'
import { getCurrentUserId } from '../../utils/authStorage'

const latestOrderStorageKey = 'latestOrder'
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const getStoredOrder = () => {
  try {
    return JSON.parse(localStorage.getItem(latestOrderStorageKey))
  } catch {
    return null
  }
}

const formatOrderDate = (value) => {
  if (!value) {
    return 'Đang cập nhật'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN')
}

function OrderSuccessPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(location.state?.order || getStoredOrder())
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [isConfirmingWallet, setIsConfirmingWallet] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadOrder = async ({ silent = false } = {}) => {
    if (!orderId) {
      return
    }

    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiOrder = await getOrderById(orderId)
      setOrder(apiOrder)
      localStorage.setItem(latestOrderStorageKey, JSON.stringify(apiOrder))
      setHasApiError(false)
    } catch {
      setOrder((currentOrder) => currentOrder || getStoredOrder())
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!orderId) {
      return undefined
    }

    const loadTimer = window.setTimeout(() => {
      loadOrder()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [orderId])

  const submitWalletPayment = async () => {
    const currentOrderId = order?.code || order?.id || orderId
    const maNguoiDung = getCurrentUserId() || order?.maNguoiDung

    setActionError('')
    setActionMessage('')

    if (!maNguoiDung) {
      setActionError('Vui lòng đăng nhập để xác nhận thanh toán ví.')
      return
    }

    try {
      setIsConfirmingWallet(true)
      await confirmWalletPayment(currentOrderId, {
        maNguoiDung,
        maGiaoDich: `VI-DEMO-DH${currentOrderId}`,
      })
      setActionMessage('Đã xác nhận thanh toán ví thành công.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể xác nhận thanh toán ví.')
    } finally {
      setIsConfirmingWallet(false)
    }
  }

  if (!order && !isLoading) {
    return (
      <div className="order-success-page">
        <section className="order-success-card">
          <div className="success-icon">!</div>
          <span>Không tìm thấy</span>
          <h1>Không tìm thấy đơn hàng</h1>
          <p>Không có mã đơn hàng hoặc dữ liệu đơn hàng để hiển thị.</p>
          <Link className="button" to="/">
            Về trang chủ
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="order-success-page">
      <section className="order-success-card">
        <div className="success-icon">✓</div>
        <span>Hoàn tất</span>
        <h1>Đặt hàng thành công</h1>
        <p>Cảm ơn bạn đã đặt mua đặc sản miền Trung. Cửa hàng sẽ liên hệ xác nhận sớm.</p>

        {isLoading ? <p className="product-result-summary">Đang tải thông tin đơn hàng...</p> : null}
        {hasApiError ? (
          <p className="product-result-summary">
            Không kết nối được backend, đang hiển thị dữ liệu đơn hàng vừa tạo.
          </p>
        ) : null}
        {actionMessage ? <p className="form-success">{actionMessage}</p> : null}
        {actionError ? <p className="form-error">{actionError}</p> : null}

        {order ? (
          <>
            <div className="success-order-code">
              <small>Mã đơn hàng</small>
              <strong>{order.code || order.id}</strong>
            </div>

            <div className="success-info-grid">
              <div>
                <span>Ngày đặt</span>
                <strong>{formatOrderDate(order.orderDate)}</strong>
              </div>
              <div>
                <span>Trạng thái đơn hàng</span>
                <strong>{orderStatusLabels[order.status] || order.status}</strong>
              </div>
              <div>
                <span>Trạng thái thanh toán</span>
                <strong>{paymentStatusLabels[order.paymentStatus] || order.paymentStatus || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Người nhận</span>
                <strong>{order.receiverName}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{order.receiverPhone || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Địa chỉ giao hàng</span>
                <strong>{order.shippingAddress}</strong>
              </div>
              <div>
                <span>Phương thức thanh toán</span>
                <strong>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</strong>
              </div>
              <div>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>

            {order.paymentMethod === 'COD' ? (
              <div className="payment-note">
                <h3>Thanh toán khi nhận hàng</h3>
                <p>Bạn sẽ thanh toán khi nhận hàng. Sau khi nhận hàng, vui lòng bấm xác nhận đã nhận hàng trong chi tiết đơn hàng.</p>
              </div>
            ) : null}

            {order.paymentMethod === 'chuyenKhoan' ? (
              <div className="payment-note">
                <h3>Hướng dẫn chuyển khoản</h3>
                <p>Ngân hàng: Demo Bank</p>
                <p>Chủ tài khoản: DAC SAN MIEN TRUNG</p>
                <p>Số tài khoản: 0123456789</p>
                <p>Số tiền: {formatCurrency(order.total)}</p>
                <p>Nội dung chuyển khoản: DH{order.code || order.id} - {order.receiverPhone}</p>
                <p>Sau khi bạn chuyển khoản, nhân viên sẽ kiểm tra và xác nhận thanh toán trên hệ thống.</p>
              </div>
            ) : null}

            {order.paymentMethod === 'vi' ? (
              <div className="payment-note">
                <h3>Thanh toán ví điện tử</h3>
                {order.paymentStatus === 'choThanhToan' ? (
                  <button className="button" type="button" onClick={submitWalletPayment} disabled={isConfirmingWallet}>
                    {isConfirmingWallet ? 'Đang xác nhận...' : 'Xác nhận thanh toán ví demo'}
                  </button>
                ) : (
                  <p>Ví điện tử đã thanh toán thành công.</p>
                )}
              </div>
            ) : null}

            {order.items?.length > 0 ? (
              <div className="checkout-mini-items order-success-items">
                {order.items.map((item) => (
                  <div key={item.id}>
                    <span>{item.image}</span>
                    <p>
                      <strong>{item.name}</strong>
                      <small>{item.variant} x {item.quantity}</small>
                    </p>
                    <b>{formatCurrency(item.total || item.price * item.quantity)}</b>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="summary-lines order-success-summary">
              <div>
                <span>Tổng tiền hàng</span>
                <strong>{formatCurrency(order.subtotal)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển</span>
                <strong>{formatCurrency(order.shippingFee)}</strong>
              </div>
              <div>
                <span>Giảm giá</span>
                <strong>-{formatCurrency(order.discount)}</strong>
              </div>
              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </div>
          </>
        ) : null}

        <div className="success-actions">
          <Link className="button secondary" to="/products">
            Tiếp tục mua sắm
          </Link>
          <Link className="button" to={order?.id ? `/orders/${order.id}` : '/profile'}>
            Xem đơn hàng
          </Link>
        </div>
      </section>
    </div>
  )
}

export default OrderSuccessPage
