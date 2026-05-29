import { useParams } from 'react-router-dom'
import PagePlaceholder from '../../components/common/PagePlaceholder'
import { mockOrders } from '../../data/mockOrders'

function OrderDetailPage() {
  const { id } = useParams()
  const order = mockOrders.find((item) => item.id === id)

  return (
    <PagePlaceholder
      title={`Chi tiết đơn hàng ${id}`}
      description={order ? `Khách hàng: ${order.customerName}. Trạng thái: ${order.status}.` : 'Không tìm thấy đơn hàng mẫu.'}
    />
  )
}

export default OrderDetailPage
