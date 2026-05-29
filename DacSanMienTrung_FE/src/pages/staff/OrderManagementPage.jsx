import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { mockOrders } from '../../data/mockOrders'

function OrderManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý đơn hàng</h1>
      <div className="table-like">
        {mockOrders.map((order) => (
          <div className="table-row" key={order.id}>
            <strong>{order.id}</strong>
            <span>{order.customerName}</span>
            <OrderStatusBadge status={order.status} />
          </div>
        ))}
      </div>
    </>
  )
}

export default OrderManagementPage
