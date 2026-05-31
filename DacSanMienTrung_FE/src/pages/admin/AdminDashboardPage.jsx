import { Link } from 'react-router-dom'
import {
  adminAlerts,
  lockedAccountCount,
  revenueLastSevenDays,
  topSellingProducts,
} from '../../data/mockAdminStats'
import { getOrderTotal, mockOrders, orderStatusLabels } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockUsers } from '../../data/mockUsers'
import { mockVouchers } from '../../data/mockVouchers'
import './AdminDashboardPage.css'

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

const productStatusNames = {
  pending: 'Chờ xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
  returning: 'Đang hoàn hàng',
}

function AdminDashboardPage() {
  const totalRevenue = mockOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((total, order) => total + getOrderTotal(order), 0)
  const monthlyRevenue = revenueLastSevenDays.reduce((total, item) => total + item.revenue, 0)
  const activeVoucherCount = mockVouchers.filter((voucher) =>
    voucher.status.toLowerCase().includes('chạy'),
  ).length
  const pendingOrderCount = mockOrders.filter((order) =>
    ['pending', 'confirmed'].includes(order.status),
  ).length
  const customerCount = mockUsers.filter((user) => user.role === 'customer').length
  const maxRevenue = Math.max(...revenueLastSevenDays.map((item) => item.revenue))

  const orderStatusStats = ['pending', 'shipping', 'completed', 'cancelled', 'returning'].map(
    (status) => ({
      status,
      label: productStatusNames[status],
      count: mockOrders.filter((order) => order.status === status).length,
    }),
  )

  const statCards = [
    { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), path: '/admin/reports' },
    { label: 'Tổng đơn hàng', value: mockOrders.length, path: '/staff/orders' },
    { label: 'Tổng khách hàng', value: customerCount, path: '/admin/accounts' },
    { label: 'Tổng sản phẩm', value: mockProducts.length, path: '/staff/products' },
    { label: 'Đơn chờ xử lý', value: pendingOrderCount, path: '/staff/orders' },
    { label: 'Voucher đang hoạt động', value: activeVoucherCount, path: '/admin/vouchers' },
    { label: 'Doanh thu tháng này', value: formatCurrency(monthlyRevenue), path: '/admin/reports' },
    { label: 'Tài khoản bị khóa', value: lockedAccountCount, path: '/admin/accounts' },
  ]

  return (
    <div className="admin-dashboard-page">
      <section className="admin-dashboard-header">
        <div>
          <span>Khu vực quản trị</span>
          <h1>Tổng quan quản trị</h1>
          <p>Theo dõi doanh thu, đơn hàng, tài khoản và các cảnh báo vận hành quan trọng.</p>
        </div>
        <Link className="button" to="/admin/reports">
          Xem báo cáo
        </Link>
      </section>

      <section className="admin-stat-grid">
        {statCards.map((card) => (
          <Link className="admin-stat-card" key={card.label} to={card.path}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </Link>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Doanh thu</span>
              <h2>Doanh thu 7 ngày gần nhất</h2>
            </div>
          </div>
          <div className="admin-revenue-chart">
            {revenueLastSevenDays.map((item) => (
              <div className="admin-revenue-bar" key={item.label}>
                <div>
                  <span style={{ height: `${Math.max((item.revenue / maxRevenue) * 100, 8)}%` }} />
                </div>
                <strong>{item.label}</strong>
                <small>{formatCurrency(item.revenue)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Đơn hàng</span>
              <h2>Đơn hàng theo trạng thái</h2>
            </div>
          </div>
          <div className="admin-order-status-list">
            {orderStatusStats.map((item) => (
              <div key={item.status}>
                <span className={`admin-status-dot admin-status-${item.status}`} />
                <strong>{item.label}</strong>
                <b>{item.count}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-wide-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Đơn hàng</span>
              <h2>Đơn hàng gần đây</h2>
            </div>
            <Link to="/staff/orders">Xem chi tiết</Link>
          </div>
          <div className="admin-recent-orders">
            <div className="admin-table-head">
              <span>Mã đơn</span>
              <span>Khách hàng</span>
              <span>Ngày đặt</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
            </div>
            {mockOrders.slice(0, 5).map((order) => (
              <div className="admin-order-row" key={order.id}>
                <strong>{order.code}</strong>
                <span>{order.customerName}</span>
                <span>{order.orderDate}</span>
                <b>{formatCurrency(getOrderTotal(order))}</b>
                <span className={`admin-order-badge admin-order-${order.status}`}>
                  {orderStatusLabels[order.status]}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Sản phẩm</span>
              <h2>Top sản phẩm bán chạy</h2>
            </div>
          </div>
          <div className="admin-top-products">
            {topSellingProducts.map((product) => (
              <div key={product.id}>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <small>{product.sold} sản phẩm</small>
                <b>{formatCurrency(product.revenue)}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span>Cảnh báo</span>
            <h2>Cảnh báo quản trị</h2>
          </div>
        </div>
        <div className="admin-alert-grid">
          {adminAlerts.map((alert) => (
            <Link key={alert.id} to={alert.path}>
              <strong>{alert.title}</strong>
              <span>{alert.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
