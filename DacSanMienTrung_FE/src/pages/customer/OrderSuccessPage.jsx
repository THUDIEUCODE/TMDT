import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getOrderById } from '../../services/orderService'

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
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    if (!orderId) {
      return undefined
    }

    const loadTimer = window.setTimeout(async () => {
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
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [orderId])

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
                <strong>{order.status}</strong>
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
                <strong>{order.paymentMethod}</strong>
              </div>
            </div>

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
