import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminDashboard } from '../../services/dashboardService'
import { normalizeOrderStatus, orderStatusLabels } from '../../services/orderService'
import { revenueLastSevenDays, topSellingProducts, lockedAccountCount } from '../../data/mockAdminStats'
import { getOrderTotal, mockOrders } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockUsers } from '../../data/mockUsers'
import { mockVouchers } from '../../data/mockVouchers'
import './ReportPage.css'

const reportOrderStatuses = [
  'choXacNhan',
  'daXacNhan',
  'dangGiao',
  'khachDaNhan',
  'daGiao',
  'daHuy',
  'dangHoanHang',
]

const timeRangeOptions = [
  { value: 'last7Days', label: '7 ngày gần nhất' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'thisQuarter', label: 'Quý này' },
  { value: 'thisYear', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chọn' },
]

const stockStatusLabels = {
  hetHang: 'Hết hàng',
  ratThap: 'Rất thấp',
  canNhapThem: 'Cần nhập thêm',
  conHang: 'Còn hàng',
  onDinh: 'Ổn định',
}

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN')

const createFallbackReport = () => {
  const totalRevenue = mockOrders
    .filter((order) => normalizeOrderStatus(order.status) !== 'daHuy')
    .reduce((total, order) => total + getOrderTotal(order), 0)
  const monthlyRevenue = revenueLastSevenDays.reduce((total, item) => total + item.revenue, 0)
  const activeVouchers = mockVouchers.filter((voucher) => {
    const isEnabled = voucher.trangThai ?? true
    const isExpired = voucher.hetHan ?? false
    const quantity = Number(voucher.soLuongTon ?? voucher.quantity ?? 0)
    return isEnabled && !isExpired && quantity > 0
  }).length
  const lowStockItems = mockProducts
    .flatMap((product) =>
      (product.variants || []).map((variant) => {
        const stock = Number(variant.stock || 0)

        return {
          id: variant.id,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variant: variant.label,
          stock,
          warningLevel: 20,
          warningStatus:
            stock === 0 ? 'hetHang' : stock <= 10 ? 'ratThap' : stock <= 20 ? 'canNhapThem' : 'onDinh',
          warningLabel: '',
        }
      }),
    )
    .filter((item) => item.stock <= 20)
    .slice(0, 8)

  return {
    totalRevenue,
    totalOrders: mockOrders.length,
    totalCustomers: mockUsers.filter((user) => user.role === 'customer' || user.role === 'khachhang').length,
    totalProducts: mockProducts.length,
    pendingOrders: mockOrders.filter((order) =>
      ['choXacNhan', 'daXacNhan'].includes(normalizeOrderStatus(order.status)),
    ).length,
    activeVouchers,
    monthlyRevenue,
    lockedAccounts: lockedAccountCount,
    revenueLast7Days: revenueLastSevenDays.map((item) => ({
      date: item.label,
      label: item.label,
      revenue: item.revenue,
    })),
    ordersByStatus: reportOrderStatuses.map((status) => ({
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
    recentOrders: mockOrders.slice(0, 6).map((order) => ({
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

const fallbackReport = createFallbackReport()

function ReportPage() {
  const navigate = useNavigate()
  const [report, setReport] = useState(fallbackReport)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState({
    timeRange: 'last7Days',
    fromDate: '',
    toDate: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadReport = async () => {
      setIsLoading(true)

      try {
        const data = await getAdminDashboard()

        if (!isMounted) {
          return
        }

        setReport({ ...fallbackReport, ...data })
        setErrorMessage('')
      } catch {
        if (!isMounted) {
          return
        }

        setReport(fallbackReport)
        setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReport()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  const maxRevenue = Math.max(1, ...(report.revenueLast7Days || []).map((item) => Number(item.revenue || 0)))

  const ordersByStatus = useMemo(() => {
    const statusMap = new Map(
      (report.ordersByStatus || []).map((item) => [normalizeOrderStatus(item.status), item]),
    )

    return reportOrderStatuses.map((status) => ({
      status,
      label: statusMap.get(status)?.label || orderStatusLabels[status] || status,
      count: Number(statusMap.get(status)?.count || 0),
    }))
  }, [report.ordersByStatus])

  const maxOrderStatusCount = Math.max(1, ...ordersByStatus.map((item) => item.count))

  const statCards = [
    { label: 'Tổng doanh thu', value: formatCurrency(report.totalRevenue) },
    { label: 'Doanh thu tháng này', value: formatCurrency(report.monthlyRevenue) },
    { label: 'Tổng đơn hàng', value: formatNumber(report.totalOrders) },
    { label: 'Tổng khách hàng', value: formatNumber(report.totalCustomers) },
    { label: 'Tổng sản phẩm', value: formatNumber(report.totalProducts) },
    { label: 'Đơn chờ xử lý', value: formatNumber(report.pendingOrders) },
    { label: 'Voucher đang hoạt động', value: formatNumber(report.activeVouchers) },
    { label: 'Tài khoản bị khóa', value: formatNumber(report.lockedAccounts) },
  ]

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const applyTimeFilter = (event) => {
    event.preventDefault()
    setNoticeMessage('Bộ lọc thời gian sẽ được kết nối backend ở bước sau.')
  }

  const refreshReport = () => {
    setNoticeMessage('')
    setRefreshKey((current) => current + 1)
  }

  const exportReport = () => {
    navigate('/admin/reports/print')
  }

  return (
    <div className="report-page">
      <section className="report-header">
        <div>
          <span>Khu vực quản trị</span>
          <h1>Báo cáo thống kê</h1>
          <p>Tổng hợp doanh thu, đơn hàng, sản phẩm bán chạy, trạng thái đơn và cảnh báo tồn kho.</p>
        </div>
        <button className="button" type="button" onClick={exportReport}>
          Xuất báo cáo
        </button>
      </section>

      {isLoading ? <div className="report-message">Đang tải báo cáo thống kê...</div> : null}
      {errorMessage ? <div className="report-message report-message-warning">{errorMessage}</div> : null}
      {noticeMessage ? <div className="report-message report-message-success">{noticeMessage}</div> : null}

      <form className="report-filter-panel" onSubmit={applyTimeFilter}>
        <label>
          Khoảng thời gian
          <select name="timeRange" value={filters.timeRange} onChange={handleFilterChange}>
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} />
        </label>
        <label>
          Đến ngày
          <input name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} />
        </label>
        <div className="report-filter-actions">
          <button className="button" type="submit">
            Áp dụng
          </button>
          <button type="button" onClick={refreshReport}>
            Làm mới
          </button>
        </div>
      </form>

      <section className="report-stat-grid">
        {statCards.map((card) => (
          <article className="report-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="report-grid">
        <article className="report-panel">
          <div className="report-panel-heading">
            <div>
              <span>Doanh thu</span>
              <h2>Doanh thu 7 ngày gần nhất</h2>
            </div>
          </div>
          {(report.revenueLast7Days || []).length ? (
            <div className="report-revenue-chart">
              {report.revenueLast7Days.map((item) => (
                <div className="report-revenue-bar" key={`${item.date}-${item.label}`}>
                  <div title={formatCurrency(item.revenue)}>
                    <span style={{ height: `${Math.max((Number(item.revenue || 0) / maxRevenue) * 100, 8)}%` }} />
                  </div>
                  <strong>{item.label || item.date}</strong>
                  <small>{formatCurrency(item.revenue)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-empty-state">Chưa có dữ liệu doanh thu.</p>
          )}
        </article>

        <article className="report-panel">
          <div className="report-panel-heading">
            <div>
              <span>Đơn hàng</span>
              <h2>Đơn hàng theo trạng thái</h2>
            </div>
          </div>
          {ordersByStatus.length ? (
            <div className="report-status-list">
              {ordersByStatus.map((item) => (
                <div key={item.status}>
                  <span className={`report-status-dot report-status-${item.status}`} />
                  <strong>{item.label}</strong>
                  <b>{formatNumber(item.count)}</b>
                  <small>
                    <i style={{ width: `${Math.max((item.count / maxOrderStatusCount) * 100, 8)}%` }} />
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="report-empty-state">Chưa có dữ liệu đơn hàng.</p>
          )}
        </article>
      </section>

      <section className="report-panel">
        <div className="report-panel-heading">
          <div>
            <span>Sản phẩm</span>
            <h2>Top sản phẩm bán chạy</h2>
          </div>
        </div>
        <div className="report-table report-top-products">
          <div className="report-table-head">
            <span>STT</span>
            <span>Tên sản phẩm</span>
            <span>Danh mục</span>
            <span>Số lượng bán</span>
            <span>Doanh thu</span>
          </div>
          {(report.topProducts || []).length ? (
            report.topProducts.map((product, index) => (
              <article className="report-table-row" key={product.productId || product.productName}>
                <strong>{index + 1}</strong>
                <span>{product.productName}</span>
                <span>{product.categoryName || '-'}</span>
                <strong>{formatNumber(product.soldQuantity)}</strong>
                <strong>{formatCurrency(product.revenue)}</strong>
              </article>
            ))
          ) : (
            <p className="report-empty-state">Chưa có dữ liệu sản phẩm bán chạy.</p>
          )}
        </div>
      </section>

      <section className="report-panel">
        <div className="report-panel-heading">
          <div>
            <span>Đơn hàng</span>
            <h2>Đơn hàng gần đây</h2>
          </div>
          <Link to="/staff/orders">Xem quản lý đơn</Link>
        </div>
        <div className="report-table report-recent-orders">
          <div className="report-table-head">
            <span>Mã đơn</span>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Ngày đặt</span>
            <span>Tổng tiền</span>
            <span>Trạng thái</span>
            <span>Thanh toán</span>
          </div>
          {(report.recentOrders || []).length ? (
            report.recentOrders.map((order) => (
              <article className="report-table-row" key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customerName || '-'}</span>
                <span>{order.phone || '-'}</span>
                <span>{order.orderDate || '-'}</span>
                <strong>{formatCurrency(order.total)}</strong>
                <span className={`report-order-badge report-order-${order.status}`}>
                  {orderStatusLabels[order.status] || order.status}
                </span>
                <span>{order.paymentMethod || '-'}</span>
              </article>
            ))
          ) : (
            <p className="report-empty-state">Chưa có đơn hàng gần đây.</p>
          )}
        </div>
      </section>

      <section className="report-panel">
        <div className="report-panel-heading">
          <div>
            <span>Tồn kho</span>
            <h2>Cảnh báo tồn kho</h2>
          </div>
          <Link to="/staff/inventory">Xem tồn kho</Link>
        </div>
        <div className="report-stock-grid">
          {(report.lowStockItems || []).length ? (
            report.lowStockItems.map((item) => (
              <article className="report-stock-card" key={item.id}>
                <strong>{item.productName}</strong>
                <span>{item.variant || 'Mặc định'}</span>
                <b>{formatNumber(item.stock)} tồn</b>
                <small>Ngưỡng {formatNumber(item.warningLevel)}</small>
                <em className={`report-stock-status report-stock-${item.warningStatus || 'onDinh'}`}>
                  {item.warningLabel || stockStatusLabels[item.warningStatus] || item.warningStatus || 'Cần kiểm tra'}
                </em>
              </article>
            ))
          ) : (
            <p className="report-empty-state">Không có cảnh báo tồn kho.</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default ReportPage
