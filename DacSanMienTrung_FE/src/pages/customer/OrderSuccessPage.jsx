import { Link } from 'react-router-dom'
import { mockOrderSuccess } from '../../data/mockOrders'

function OrderSuccessPage() {
  return (
    <div className="order-success-page">
      <section className="order-success-card">
        <div className="success-icon">✓</div>
        <span>Hoàn tất</span>
        <h1>Đặt hàng thành công</h1>
        <p>Cảm ơn bạn đã đặt mua đặc sản miền Trung. Cửa hàng sẽ liên hệ xác nhận sớm.</p>

        <div className="success-order-code">
          <small>Mã đơn hàng</small>
          <strong>{mockOrderSuccess.id}</strong>
        </div>

        <div className="success-info-grid">
          <div>
            <span>Người nhận</span>
            <strong>{mockOrderSuccess.receiverName}</strong>
          </div>
          <div>
            <span>Địa chỉ giao hàng</span>
            <strong>{mockOrderSuccess.shippingAddress}</strong>
          </div>
          <div>
            <span>Phương thức thanh toán</span>
            <strong>{mockOrderSuccess.paymentMethod}</strong>
          </div>
          <div>
            <span>Tổng thanh toán</span>
            <strong>{mockOrderSuccess.total.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div>
            <span>Trạng thái đơn hàng</span>
            <strong>{mockOrderSuccess.status}</strong>
          </div>
        </div>

        <div className="success-actions">
          <Link className="button secondary" to="/categories">
            Tiếp tục mua sắm
          </Link>
          <Link className="button" to="/orders">
            Xem đơn hàng của tôi
          </Link>
        </div>
      </section>
    </div>
  )
}

export default OrderSuccessPage
