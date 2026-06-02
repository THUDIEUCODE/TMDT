import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { getOrderTotal, mockOrders } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockStaffStats, mockStaffTasks } from '../../data/mockStaffDashboard'
import { getStaffDashboard } from '../../services/dashboardService'
import { normalizeOrderStatus, orderStatusLabels } from '../../services/orderService'
import './StaffDashboardPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const getProductName = (product) => product.manageName || product.name
const warningStatusLabels = {
  hetHang: 'Hết hàng',
  ratThap: 'Rất thấp',
  canNhapThem: 'Cần nhập thêm',
  onDinh: 'Ổn định',
}

const fallbackLowStockItems = mockProducts
  .flatMap((product) =>
    product.variants.map((variant) => ({
      id: `${product.id}-${variant.id}`,
      productName: getProductName(product),
      variant: variant.label,
      stock: variant.stock,
      warningLevel: 10,
      warningStatus: variant.stock <= 10 ? 'ratThap' : 'canNhapThem',
    })),
  )
  .sort((first, second) => first.stock - second.stock)
  .slice(0, 5)

const fallbackDashboard = {
  totalTodayOrders: mockStaffStats.todayOrders,
  pendingOrders: mockStaffStats.pendingOrders,
  shippingOrders: mockStaffStats.shippingOrders,
  todayRevenue: mockStaffStats.todayRevenue,
  lowStockCount: mockStaffStats.lowStockProducts,
  pendingReturns: mockStaffStats.pendingReturns,
  pendingReviews: mockStaffStats.pendingReviews,
  recentOrders: mockOrders.slice(0, 5).map((order) => ({
    id: order.id,
    customerName: order.customerName || order.receiverName,
    phone: order.phone || order.receiverPhone,
    orderDate: order.orderDate,
    total: getOrderTotal(order),
    status: normalizeOrderStatus(order.status),
    paymentMethod: order.paymentMethod,
  })),
  lowStockItems: fallbackLowStockItems,
}

function StaffDashboardPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      try {
        const apiDashboard = await getStaffDashboard()
        setDashboard(apiDashboard)
        setHasApiError(false)
      } catch {
        setDashboard(fallbackDashboard)
        setHasApiError(true)
      } finally {
        setIsLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [])

  const statCards = useMemo(() => [
    {
      label: 'Tổng đơn hôm nay',
      value: dashboard.totalTodayOrders,
      hint: 'Đơn phát sinh trong ca làm',
      path: '/staff/orders',
    },
    {
      label: 'Đơn chờ xác nhận',
      value: dashboard.pendingOrders,
      hint: orderStatusLabels.choXacNhan,
      path: '/staff/orders',
    },
    {
      label: 'Đơn đang giao',
      value: dashboard.shippingOrders,
      hint: orderStatusLabels.dangGiao,
      path: '/staff/orders',
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(dashboard.todayRevenue),
      hint: 'Doanh thu từ đơn đã xác nhận',
      path: '/staff/orders',
    },
    {
      label: 'Sản phẩm sắp hết hàng',
      value: dashboard.lowStockCount,
      hint: 'Biến thể dưới mức cảnh báo',
      path: '/staff/inventory',
    },
    {
      label: 'Hoàn hàng chờ xử lý',
      value: dashboard.pendingReturns,
      hint: 'Yêu cầu cần phản hồi',
      path: '/staff/returns',
    },
    {
      label: 'Đánh giá chờ duyệt',
      value: dashboard.pendingReviews,
      hint: 'Nội dung mới từ khách hàng',
      path: '/staff/reviews',
    },
  ], [dashboard])

  const taskCards = useMemo(() => {
    const taskCounts = {
      'task-orders': dashboard.pendingOrders,
      'task-returns': dashboard.pendingReturns,
      'task-reviews': dashboard.pendingReviews,
      'task-products': dashboard.lowStockCount,
    }

    return mockStaffTasks.map((task) => ({
      ...task,
      count: taskCounts[task.id] ?? task.count,
    }))
  }, [dashboard])

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

      {isLoading ? <p className="staff-dashboard-message">Đang tải thống kê...</p> : null}
      {hasApiError ? (
        <p className="staff-dashboard-message">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

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
              <span>Số điện thoại</span>
              <span>Ngày đặt</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
              <span>Thanh toán</span>
              <span />
            </div>

            {dashboard.recentOrders.map((order) => (
              <div className="staff-table-row" key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customerName}</span>
                <span>{order.phone || 'Đang cập nhật'}</span>
                <span>{order.orderDate}</span>
                <span>{formatCurrency(order.total)}</span>
                <OrderStatusBadge status={order.status} />
                <span>{order.paymentMethod || 'Đang cập nhật'}</span>
                <Link to="/staff/orders">Xem</Link>
              </div>
            ))}
            {dashboard.recentOrders.length === 0 ? (
              <p className="staff-empty-state">Chưa có đơn hàng mới.</p>
            ) : null}
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
            {dashboard.lowStockItems.map((item) => (
              <div className="stock-alert-item" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.variant}</span>
                </div>
                <b>{item.stock}</b>
                <span className="stock-warning-level">Mức cảnh báo: {item.warningLevel}</span>
                <small>{warningStatusLabels[item.warningStatus] || item.warningStatus || 'Đang cập nhật'}</small>
              </div>
            ))}
            {dashboard.lowStockItems.length === 0 ? (
              <p className="staff-empty-state">Không có sản phẩm cần cảnh báo.</p>
            ) : null}
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
            {taskCards.map((task) => (
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
