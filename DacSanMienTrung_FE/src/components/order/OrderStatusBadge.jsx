import { orderStatusLabels } from '../../data/mockOrders'
import './OrderStatusBadge.css'

function OrderStatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{orderStatusLabels[status] || status}</span>
}

export default OrderStatusBadge
