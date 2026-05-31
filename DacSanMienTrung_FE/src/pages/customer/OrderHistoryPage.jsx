import { Link } from 'react-router-dom'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { getOrderTotal, mockOrders } from '../../data/mockOrders'

function OrderHistoryPage() {
  return (
    <>
      <h1 className="page-title">Lịch sử đơn hàng</h1>
      <div className="table-like">
        {mockOrders.map((order) => (
          <div className="table-row" key={order.id}>
            <Link to={`/orders/${order.id}`}>{order.id}</Link>
            <OrderStatusBadge status={order.status} />
            <strong>{getOrderTotal(order).toLocaleString('vi-VN')}đ</strong>
          </div>
        ))}
      </div>
    </>
  )
}

export default OrderHistoryPage
