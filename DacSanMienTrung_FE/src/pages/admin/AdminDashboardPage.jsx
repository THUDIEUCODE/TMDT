import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../services/dashboardService'
import { normalizeOrderStatus, orderStatusLabels } from '../../services/orderService'
import {
  lockedAccountCount,
  revenueLastSevenDays,
  topSellingProducts,
} from '../../data/mockAdminStats'
import { getOrderTotal, mockOrders } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockUsers } from '../../data/mockUsers'
import { mockVouchers } from '../../data/mockVouchers'
import './AdminDashboardPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const dashboardOrderStatuses = [
  'choXacNhan',
  'daXacNhan',
  'dangGiao',
  'khachDaNhan',
  'daGiao',
  'daHuy',
  'dangHoanHang',
]

const stockStatusLabels = {
  hetHang: 'Hết hàng',
  ratThap: 'Rất thấp',
  canNhapThem: 'Cần nhập thêm',
  conHang: 'Còn hàng',
  onDinh: 'Ổn định',
}

const quickLinks = [
  { label: 'Quản lý tài khoản', description: 'Kiểm tra khách hàng, nhân viên và tài khoản bị khóa.', path: '/admin/accounts' },
  { label: 'Quản lý voucher', description: 'Theo dõi mã giảm giá đang hoạt động.', path: '/admin/vouchers' },
  { label: 'Báo cáo', description: 'Xem báo cáo doanh thu và vận hành.', path: '/admin/reports' },
  { label: 'Đơn hàng', description: 'Xử lý đơn hàng mới và cập nhật trạng thái.', path: '/staff/orders' },
  { label: 'Tồn kho', description: 'Theo dõi biến thể sắp hết hàng và nhập thêm.', path: '/staff/inventory' },
]

const createFallbackDashboard = () => {
  const totalRevenue = mockOrders
    .filter((order) => normalizeOrderStatus(order.status) !== 'daHuy')
    .reduce((total, order) => total + getOrderTotal(order), 0)
  const monthlyRevenue = revenueLastSevenDays.reduce((total, item) => total + item.revenue, 0)
  const activeVouchers = mockVouchers.filter((voucher) =>
    String(voucher.status || '').toLowerCase().includes('chạy'),
  ).length
  const pendingOrders = mockOrders.filter((order) =>
    ['choXacNhan', 'daXacNhan'].includes(normalizeOrderStatus(order.status)),
  ).length
  const lowStockItems = mockProducts
    .flatMap((product) =>
      (product.variants || []).map((variant) => ({
        id: variant.id,
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variant: variant.label,
        stock: Number(variant.stock || 0),
        warningLevel: 20,
        warningStatus:
          Number(variant.stock || 0) === 0
            ? 'hetHang'
            : Number(variant.stock || 0) <= 10
              ? 'ratThap'
              : 'canNhapThem',
        warningLabel: '',
      })),
    )
    .filter((item) => item.stock <= 20)
    .slice(0, 5)

  return {
    totalRevenue,
    totalOrders: mockOrders.length,
    totalCustomers: mockUsers.filter((user) => user.role === 'customer').length,
    totalProducts: mockProducts.length,
    pendingOrders,
    activeVouchers,
    monthlyRevenue,
    lockedAccounts: lockedAccountCount,
    revenueLast7Days: revenueLastSevenDays.map((item) => ({
      date: item.label,
      label: item.label,
      revenue: item.revenue,
    })),
    ordersByStatus: dashboardOrderStatuses.map((status) => ({
      status,
      label: orderStatusLabels[status],
      count: mockOrders.filter((order) => normalizeOrderStatus(order.status) === status).length,
    })),
    topProducts: topSellingProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      categoryName: product.category,
      soldQuantity: product.sold,
      revenue: product.revenue,
    })),
    recentOrders: mockOrders.slice(0, 5).map((order) => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      orderDate: order.orderDate,
      total: getOrderTotal(order),
      status: normalizeOrderStatus(order.status),
      paymentMethod: order.paymentMethod,
    })),
    lowStockItems,
  }
}

function AdminDashboardPage() {
  const fallbackDashboard = useMemo(createFallbackDashboard, [])
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAdminDashboard()
      setDashboard({ ...fallbackDashboard, ...data })
      setErrorMessage('')
    } catch (error) {
      setDashboard(fallbackDashboard)
      setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
    } finally {
      setIsLoading(false)
    }
  }, [fallbackDashboard])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const ordersByStatus = useMemo(() => {
    const statusMap = new Map(
      (dashboard.ordersByStatus || []).map((item) => [normalizeOrderStatus(item.status), item]),
    )

    return dashboardOrderStatuses.map((status) => ({
      status,
      label: statusMap.get(status)?.label || orderStatusLabels[status] || status,
      count: Number(statusMap.get(status)?.count || 0),
    }))
  }, [dashboard.ordersByStatus])

  const maxRevenue = Math.max(1, ...(dashboard.revenueLast7Days || []).map((item) => Number(item.revenue || 0)))

  const statCards = [
    { label: 'Tổng doanh thu', value: formatCurrency(dashboard.totalRevenue), path: '/admin/reports' },
    { label: 'Tổng đơn hàng', value: dashboard.totalOrders, path: '/staff/orders' },
    { label: 'Tổng khách hàng', value: dashboard.totalCustomers, path: '/admin/accounts' },
    { label: 'Tổng sản phẩm', value: dashboard.totalProducts, path: '/staff/products' },
    { label: 'Đơn chờ xử lý', value: dashboard.pendingOrders, path: '/staff/orders' },
    { label: 'Voucher đang hoạt động', value: dashboard.activeVouchers, path: '/admin/vouchers' },
    { label: 'Doanh thu tháng này', value: formatCurrency(dashboard.monthlyRevenue), path: '/admin/reports' },
    { label: 'Tài khoản bị khóa', value: dashboard.lockedAccounts, path: '/admin/accounts' },
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

      {isLoading ? <div className="admin-dashboard-message">Đang tải thống kê quản trị...</div> : null}
      {errorMessage ? <div className="admin-dashboard-message admin-dashboard-error">{errorMessage}</div> : null}

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
          {(dashboard.revenueLast7Days || []).length ? (
            <div className="admin-revenue-chart">
              {dashboard.revenueLast7Days.map((item) => (
                <div className="admin-revenue-bar" key={`${item.date}-${item.label}`}>
                  <div>
                    <span style={{ height: `${Math.max((Number(item.revenue || 0) / maxRevenue) * 100, 8)}%` }} />
                  </div>
                  <strong>{item.label || item.date}</strong>
                  <small>{formatCurrency(item.revenue)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty-state">Chưa có dữ liệu doanh thu.</p>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Đơn hàng</span>
              <h2>Đơn hàng theo trạng thái</h2>
            </div>
          </div>
          <div className="admin-order-status-list">
            {ordersByStatus.map((item) => (
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
              <span>Số điện thoại</span>
              <span>Ngày đặt</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
              <span>Thanh toán</span>
            </div>
            {(dashboard.recentOrders || []).length ? (
              dashboard.recentOrders.map((order) => (
                <div className="admin-order-row" key={order.id}>
                  <Link to="/staff/orders">{order.id}</Link>
                  <span>{order.customerName || 'Khách hàng'}</span>
                  <span>{order.phone || '-'}</span>
                  <span>{order.orderDate || '-'}</span>
                  <b>{formatCurrency(order.total)}</b>
                  <span className={`admin-order-badge admin-order-${order.status}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                  <span>{order.paymentMethod || '-'}</span>
                </div>
              ))
            ) : (
              <p className="admin-empty-state">Chưa có đơn hàng gần đây.</p>
            )}
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
            {(dashboard.topProducts || []).length ? (
              dashboard.topProducts.map((product) => (
                <div key={product.productId || product.productName}>
                  <strong>{product.productName}</strong>
                  <span>{product.categoryName || 'Chưa phân loại'}</span>
                  <small>{Number(product.soldQuantity || 0).toLocaleString('vi-VN')} sản phẩm</small>
                  <b>{formatCurrency(product.revenue)}</b>
                </div>
              ))
            ) : (
              <p className="admin-empty-state">Chưa có dữ liệu sản phẩm bán chạy.</p>
            )}
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel admin-wide-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Tồn kho</span>
              <h2>Cảnh báo tồn kho</h2>
            </div>
            <Link to="/staff/inventory">Xem tồn kho</Link>
          </div>
          <div className="admin-low-stock-list">
            {(dashboard.lowStockItems || []).length ? (
              dashboard.lowStockItems.map((item) => (
                <Link to="/staff/inventory" key={item.id}>
                  <strong>{item.productName}</strong>
                  <span>{item.variant || 'Mặc định'}</span>
                  <b>{Number(item.stock || 0).toLocaleString('vi-VN')} tồn</b>
                  <small>
                    {item.warningLabel || stockStatusLabels[item.warningStatus] || item.warningStatus || 'Cần kiểm tra'}
                    {item.warningLevel ? ` - ngưỡng ${item.warningLevel}` : ''}
                  </small>
                </Link>
              ))
            ) : (
              <p className="admin-empty-state">Không có cảnh báo tồn kho.</p>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Truy cập nhanh</span>
              <h2>Liên kết quản trị</h2>
            </div>
          </div>
          <div className="admin-quick-grid">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <strong>{link.label}</strong>
                <span>{link.description}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

export default AdminDashboardPage
