import { Link, useParams } from 'react-router-dom'
import {
  getOrderSubtotal,
  getOrderTotal,
  mockOrders,
  orderStatusLabels,
} from '../../data/mockOrders'
import '../../components/order/OrderStatusBadge.css'
import './OrderDetailPage.css'

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

function OrderDetailPage() {
  const { id } = useParams()
  const order = mockOrders.find((item) => item.id === id)

  if (!order) {
    return (
      <section className="order-detail-empty">
        <h1>Không tìm thấy đơn hàng</h1>
        <p>Đơn hàng mẫu không tồn tại hoặc đã bị xóa khỏi dữ liệu mock.</p>
        <Link className="button" to="/profile">
          Quay lại tài khoản
        </Link>
      </section>
    )
  }

  const subtotal = getOrderSubtotal(order)
  const total = getOrderTotal(order)

  return (
    <div className="order-detail-page">
      <section className="order-detail-hero">
        <div>
          <span>Chi tiết đơn hàng</span>
          <h1>{order.id}</h1>
          <p>Ngày đặt: {order.orderDate}</p>
        </div>
        <span className={`status-badge status-${order.status}`}>
          {orderStatusLabels[order.status]}
        </span>
      </section>

      <section className="order-detail-grid">
        <article className="order-detail-card">
          <h2>Người nhận</h2>
          <div className="detail-lines">
            <p>
              <span>Họ tên</span>
              <strong>{order.receiverName}</strong>
            </p>
            <p>
              <span>Số điện thoại</span>
              <strong>{order.receiverPhone}</strong>
            </p>
            <p>
              <span>Địa chỉ giao hàng</span>
              <strong>{order.shippingAddress}</strong>
            </p>
            <p>
              <span>Phương thức thanh toán</span>
              <strong>{order.paymentMethod}</strong>
            </p>
          </div>
        </article>

        <article className="order-detail-card">
          <h2>Lịch sử trạng thái</h2>
          <div className="timeline-list">
            {order.timeline.map((item) => (
              <div key={`${item.time}-${item.label}`}>
                <span />
                <p>
                  <strong>{item.label}</strong>
                  <small>{item.time}</small>
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="order-detail-card">
        <h2>Sản phẩm trong đơn</h2>
        <div className="order-items-table">
          <div className="order-items-head">
            <span>Sản phẩm</span>
            <span>Quy cách</span>
            <span>Số lượng</span>
            <span>Đơn giá</span>
            <span>Thành tiền</span>
          </div>

          {order.items.map((item) => (
            <div className="order-item-row" key={item.id}>
              <div className="order-item-product">
                <span>{item.image}</span>
                <strong>{item.name}</strong>
              </div>
              <span>{item.variant}</span>
              <span>{item.quantity}</span>
              <span>{formatCurrency(item.price)}</span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="order-detail-bottom">
        <Link className="button secondary" to="/profile">
          Quay lại tài khoản
        </Link>

        <aside className="order-total-card">
          <div>
            <span>Tạm tính</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <strong>{formatCurrency(order.shippingFee)}</strong>
          </div>
          <div>
            <span>Giảm giá/voucher</span>
            <strong>-{formatCurrency(order.discount)}</strong>
          </div>
          <div className="order-total-line">
            <span>Tổng thanh toán</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default OrderDetailPage
