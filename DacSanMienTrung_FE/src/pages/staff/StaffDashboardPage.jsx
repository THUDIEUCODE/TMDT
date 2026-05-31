import { Link } from 'react-router-dom'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { getOrderTotal, mockOrders, orderStatusLabels } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockStaffStats, mockStaffTasks } from '../../data/mockStaffDashboard'
import './StaffDashboardPage.css'

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

const getProductName = (product) => product.manageName || product.name

const lowStockItems = mockProducts
  .flatMap((product) =>
    product.variants.map((variant) => ({
      id: `${product.id}-${variant.id}`,
      productName: getProductName(product),
      variant: variant.label,
      stock: variant.stock,
      alertLevel: variant.stock <= 10 ? 'Rất thấp' : 'Cần nhập thêm',
    })),
  )
  .sort((first, second) => first.stock - second.stock)
  .slice(0, 5)

function StaffDashboardPage() {
  const latestOrders = mockOrders.slice(0, 5)

  const statCards = [
    {
      label: 'Tổng đơn hôm nay',
      value: mockStaffStats.todayOrders,
      hint: 'Đơn phát sinh trong ca làm',
      path: '/staff/orders',
    },
    {
      label: 'Đơn chờ xác nhận',
      value: mockStaffStats.pendingOrders,
      hint: orderStatusLabels.pending,
      path: '/staff/orders',
    },
    {
      label: 'Đơn đang giao',
      value: mockStaffStats.shippingOrders,
      hint: orderStatusLabels.shipping,
      path: '/staff/orders',
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(mockStaffStats.todayRevenue),
      hint: 'Doanh thu từ đơn đã xác nhận',
      path: '/staff/orders',
    },
    {
      label: 'Sản phẩm sắp hết hàng',
      value: mockStaffStats.lowStockProducts,
      hint: 'Biến thể dưới mức cảnh báo',
      path: '/staff/inventory',
    },
    {
      label: 'Hoàn hàng chờ xử lý',
      value: mockStaffStats.pendingReturns,
      hint: 'Yêu cầu cần phản hồi',
      path: '/staff/returns',
    },
    {
      label: 'Đánh giá chờ duyệt',
      value: mockStaffStats.pendingReviews,
      hint: 'Nội dung mới từ khách hàng',
      path: '/staff/reviews',
    },
  ]

  return (
    <>
      <section className="staff-page-header">
        <div>
          <span>Tổng quan vận hành</span>
          <h1>Dashboard nhân viên</h1>
          <p>Theo dõi đơn hàng, tồn kho và các việc cần xử lý trong ngày.</p>
        </div>
        <Link className="button" to="/staff/orders">
          Xem đơn hàng
        </Link>
      </section>

      <section className="staff-stat-grid">
        {statCards.map((card) => (
          <Link className="staff-stat-card" key={card.label} to={card.path}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.hint}</small>
          </Link>
        ))}
      </section>

      <section className="staff-dashboard-grid">
        <article className="staff-panel staff-orders-panel">
          <div className="staff-panel-heading">
            <div>
              <span>Đơn hàng</span>
              <h2>Đơn hàng mới nhất</h2>
            </div>
            <Link to="/staff/orders">Xem tất cả</Link>
          </div>

          <div className="staff-order-table">
            <div className="staff-table-head">
              <span>Mã đơn</span>
              <span>Khách hàng</span>
              <span>Ngày đặt</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
              <span />
            </div>

            {latestOrders.map((order) => (
              <div className="staff-table-row" key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customerName}</span>
                <span>{order.orderDate}</span>
                <span>{formatCurrency(getOrderTotal(order))}</span>
                <OrderStatusBadge status={order.status} />
                <Link to="/staff/orders">Xem</Link>
              </div>
            ))}
          </div>
        </article>

        <article className="staff-panel">
          <div className="staff-panel-heading">
            <div>
              <span>Tồn kho</span>
              <h2>Cảnh báo tồn kho</h2>
            </div>
            <Link to="/staff/inventory">Quản lý</Link>
          </div>

          <div className="stock-alert-list">
            {lowStockItems.map((item) => (
              <div className="stock-alert-item" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.variant}</span>
                </div>
                <b>{item.stock}</b>
                <small>{item.alertLevel}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="staff-panel staff-task-panel">
          <div className="staff-panel-heading">
            <div>
              <span>Công việc</span>
              <h2>Việc cần xử lý</h2>
            </div>
          </div>

          <div className="staff-task-list">
            {mockStaffTasks.map((task) => (
              <Link className="staff-task-item" key={task.id} to={task.path}>
                <b>{task.count}</b>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.description}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}

export default StaffDashboardPage
