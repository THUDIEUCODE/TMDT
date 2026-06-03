import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { revenueLastSevenDays, topSellingProducts } from '../../data/mockAdminStats'
import { getOrderTotal, mockOrders } from '../../data/mockOrders'
import { mockProducts } from '../../data/mockProducts'
import { mockUsers } from '../../data/mockUsers'
import { getAdminDashboard } from '../../services/dashboardService'
import { normalizeOrderStatus, orderStatusLabels } from '../../services/orderService'
import { getCurrentUser } from '../../utils/authStorage'
import './ReportPrintPage.css'

const stockStatusLabels = {
  hetHang: 'Hết hàng',
  ratThap: 'Rất thấp',
  canNhapThem: 'Cần nhập thêm',
  conHang: 'Còn hàng',
  onDinh: 'Ổn định',
}

const reportTypes = [
  { value: 'business', label: 'Báo cáo kinh doanh' },
  { value: 'orders', label: 'Báo cáo đơn hàng' },
  { value: 'inventory', label: 'Báo cáo tồn kho' },
]

const reportTitleByType = {
  business: 'BÁO CÁO THỐNG KÊ KINH DOANH',
  orders: 'BÁO CÁO ĐƠN HÀNG',
  inventory: 'BÁO CÁO TỒN KHO',
}

const orderStatusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label })),
]

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN')
const formatDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

const createFallbackReport = () => {
  const totalRevenue = mockOrders
    .filter((order) => normalizeOrderStatus(order.status) !== 'daHuy')
    .reduce((total, order) => total + getOrderTotal(order), 0)
  const lowStockItems = mockProducts
    .flatMap((product) =>
      (product.variants || []).map((variant) => {
        const stock = Number(variant.stock || 0)

        return {
          id: variant.id,
          productName: product.name,
          variant: variant.label,
          stock,
          warningLevel: 20,
          warningStatus: stock === 0 ? 'hetHang' : stock <= 10 ? 'ratThap' : stock <= 20 ? 'canNhapThem' : 'onDinh',
        }
      }),
    )
    .filter((item) => item.stock <= 20)
    .slice(0, 8)

  return {
    totalRevenue,
    monthlyRevenue: revenueLastSevenDays.reduce((total, item) => total + item.revenue, 0),
    totalOrders: mockOrders.length,
    totalCustomers: mockUsers.filter((user) => user.role === 'customer' || user.role === 'khachhang').length,
    totalProducts: mockProducts.length,
    pendingOrders: mockOrders.filter((order) => ['choXacNhan', 'daXacNhan'].includes(normalizeOrderStatus(order.status))).length,
    topProducts: topSellingProducts.map((product) => ({
      productId: product.id,
      productName: product.name,
      categoryName: product.category,
      soldQuantity: product.sold,
      revenue: product.revenue,
    })),
    recentOrders: mockOrders.slice(0, 8).map((order) => ({
      id: order.id,
      customerName: order.customerName,
      orderDate: order.orderDate,
      total: getOrderTotal(order),
      status: normalizeOrderStatus(order.status),
      paymentMethod: order.paymentMethod,
    })),
    lowStockItems,
  }
}

const fallbackReport = createFallbackReport()

function buildCsv(report, reportType, filteredOrders, orderStatusSummary, totalStock) {
  let rows = []

  if (reportType === 'business') {
    rows = [
      ['T\u1ed5ng quan kinh doanh'],
      ['Ch\u1ec9 ti\u00eau', 'Gi\u00e1 tr\u1ecb'],
      ['T\u1ed5ng doanh thu', report.totalRevenue],
      ['Doanh thu th\u00e1ng n\u00e0y', report.monthlyRevenue],
      ['T\u1ed5ng \u0111\u01a1n h\u00e0ng', report.totalOrders],
      ['T\u1ed5ng kh\u00e1ch h\u00e0ng', report.totalCustomers],
      ['T\u1ed5ng s\u1ea3n ph\u1ea9m', report.totalProducts],
      [],
      ['Top s\u1ea3n ph\u1ea9m b\u00e1n ch\u1ea1y'],
      ['STT', 'T\u00ean s\u1ea3n ph\u1ea9m', 'Danh m\u1ee5c', 'S\u1ed1 l\u01b0\u1ee3ng b\u00e1n', 'Doanh thu'],
      ...(report.topProducts || []).map((product, index) => [
        index + 1,
        product.productName,
        product.categoryName || '',
        product.soldQuantity,
        product.revenue,
      ]),
    ]
  }

  if (reportType === 'orders') {
    rows = [
      ['T\u1ed5ng quan \u0111\u01a1n h\u00e0ng'],
      ['Ch\u1ec9 ti\u00eau', 'Gi\u00e1 tr\u1ecb'],
      ['T\u1ed5ng \u0111\u01a1n h\u00e0ng', report.totalOrders],
      ['\u0110\u01a1n ch\u1edd x\u1eed l\u00fd', report.pendingOrders],
      [],
      ['\u0110\u01a1n h\u00e0ng theo tr\u1ea1ng th\u00e1i'],
      ['Tr\u1ea1ng th\u00e1i', 'S\u1ed1 l\u01b0\u1ee3ng'],
      ...(orderStatusSummary || []).map((item) => [item.label || orderStatusLabels[item.status] || item.status, item.count]),
      [],
      ['\u0110\u01a1n h\u00e0ng g\u1ea7n \u0111\u00e2y'],
      ['M\u00e3 \u0111\u01a1n', 'Kh\u00e1ch h\u00e0ng', 'Ng\u00e0y \u0111\u1eb7t', 'T\u1ed5ng ti\u1ec1n', 'Tr\u1ea1ng th\u00e1i', 'Thanh to\u00e1n'],
      ...(filteredOrders || []).map((order) => [
        order.id,
        order.customerName || '',
        order.orderDate || '',
        order.total,
        orderStatusLabels[order.status] || order.status,
        order.paymentMethod || '',
      ]),
    ]
  }

  if (reportType === 'inventory') {
    rows = [
      ['T\u1ed5ng quan t\u1ed3n kho'],
      ['Ch\u1ec9 ti\u00eau', 'Gi\u00e1 tr\u1ecb'],
      ['T\u1ed5ng s\u1ea3n ph\u1ea9m', report.totalProducts],
      ['T\u1ed5ng t\u1ed3n kho', totalStock],
      [],
      ['C\u1ea3nh b\u00e1o t\u1ed3n kho'],
      ['S\u1ea3n ph\u1ea9m', 'Bi\u1ebfn th\u1ec3', 'T\u1ed3n kho', 'Ng\u01b0\u1ee1ng', 'Tr\u1ea1ng th\u00e1i'],
      ...(report.lowStockItems || []).map((item) => [
        item.productName,
        item.variant || 'M\u1eb7c \u0111\u1ecbnh',
        item.stock,
        item.warningLevel,
        item.warningLabel || stockStatusLabels[item.warningStatus] || item.warningStatus || '',
      ]),
    ]
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n')
}

function ReportPrintPage() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [report, setReport] = useState(fallbackReport)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState({
    reportType: 'business',
    fromDate: '',
    toDate: '',
    orderStatus: 'all',
  })

  useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const data = await getAdminDashboard()
        setReport({ ...fallbackReport, ...data })
        setErrorMessage('')
      } catch {
        setReport(fallbackReport)
        setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
      } finally {
        setIsLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [refreshKey])

  const reportPeriod = useMemo(() => {
    if (filters.fromDate || filters.toDate) {
      return `${filters.fromDate ? formatDate(filters.fromDate) : '...'} - ${filters.toDate ? formatDate(filters.toDate) : '...'}`
    }

    return 'Tổng hợp hiện tại'
  }, [filters.fromDate, filters.toDate])

  const filteredOrders = useMemo(() => {
    if (filters.orderStatus === 'all') return report.recentOrders || []
    return (report.recentOrders || []).filter((order) => order.status === filters.orderStatus)
  }, [filters.orderStatus, report.recentOrders])

  const orderStatusSummary = useMemo(() => {
    if ((report.ordersByStatus || []).length) {
      return report.ordersByStatus
    }

    const statusMap = (report.recentOrders || []).reduce((map, order) => {
      const status = order.status || 'unknown'
      map.set(status, (map.get(status) || 0) + 1)
      return map
    }, new Map())

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      label: orderStatusLabels[status] || status,
      count,
    }))
  }, [report.ordersByStatus, report.recentOrders])

  const totalStock = useMemo(
    () => Number(report.totalStock ?? report.tongTonKho ?? (report.lowStockItems || []).reduce((sum, item) => sum + Number(item.stock || 0), 0)),
    [report],
  )

  const reportTitle = reportTitleByType[filters.reportType] || reportTitleByType.business

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }
  const printReport = () => {
    window.print()
  }

  const exportCsv = () => {
    const csv = buildCsv(report, filters.reportType, filteredOrders, orderStatusSummary, totalStock)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bao-cao-thong-ke-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const refreshReport = () => {
    setRefreshKey((current) => current + 1)
  }

  const businessOverview = [
    ['T\u1ed5ng doanh thu', formatCurrency(report.totalRevenue)],
    ['Doanh thu th\u00e1ng n\u00e0y', formatCurrency(report.monthlyRevenue)],
    ['T\u1ed5ng \u0111\u01a1n h\u00e0ng', formatNumber(report.totalOrders)],
    ['T\u1ed5ng kh\u00e1ch h\u00e0ng', formatNumber(report.totalCustomers)],
    ['T\u1ed5ng s\u1ea3n ph\u1ea9m', formatNumber(report.totalProducts)],
  ]

  const orderOverview = [
    ['T\u1ed5ng \u0111\u01a1n h\u00e0ng', formatNumber(report.totalOrders)],
    ['\u0110\u01a1n ch\u1edd x\u1eed l\u00fd', formatNumber(report.pendingOrders)],
  ]

  const inventoryOverview = [
    ['T\u1ed5ng s\u1ea3n ph\u1ea9m', formatNumber(report.totalProducts)],
    ['T\u1ed5ng t\u1ed3n kho', formatNumber(totalStock)],
  ]

  return (
    <div className="report-print-page">
      <aside className="report-print-controls">
        <button className="report-back-button" type="button" onClick={() => navigate('/admin/reports')}>
          ← Quay lại
        </button>

        <div className="report-print-control-card">
          <label>
            Loại báo cáo
            <select name="reportType" value={filters.reportType} onChange={updateFilter}>
              {reportTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </label>
          <label>
            Từ ngày
            <input name="fromDate" type="date" value={filters.fromDate} onChange={updateFilter} />
          </label>
          <label>
            Đến ngày
            <input name="toDate" type="date" value={filters.toDate} onChange={updateFilter} />
          </label>
          <label>
            Trạng thái đơn hàng
            <select name="orderStatus" value={filters.orderStatus} onChange={updateFilter}>
              {orderStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={printReport}>In PDF</button>
          <button type="button" onClick={exportCsv}>Xuất Excel</button>
          <button type="button" onClick={refreshReport}>Làm mới</button>
        </div>

        {isLoading ? <p className="report-print-note">Đang tải báo cáo...</p> : null}
        {errorMessage ? <p className="report-print-note warning">{errorMessage}</p> : null}
      </aside>

      <main className="report-print-preview-wrap">
        <article className="report-print-paper">
          <header className="report-company-header">
            <h2>{'C\u00d4NG TY \u0110\u1eb6C S\u1ea2N MI\u1ec0N TRUNG'}</h2>
            <p>{'\u0110\u1ecba ch\u1ec9: 01 \u0110\u01b0\u1eddng \u0110\u1eb7c S\u1ea3n, \u0110\u00e0 N\u1eb5ng'}</p>
            <p>{'\u0110i\u1ec7n tho\u1ea1i: 0900 000 000'}</p>
            <p>Email: contact@dacsanmientrung.vn</p>
          </header>

          <section className="report-title-block">
            <h1>{reportTitle}</h1>
          </section>

          <section className="report-print-info">
            <p><span>{'Ng\u00e0y l\u1eadp b\u00e1o c\u00e1o:'}</span><strong>{formatDate(new Date())}</strong></p>
            <p><span>{'Kho\u1ea3ng th\u1eddi gian:'}</span><strong>{reportPeriod}</strong></p>
            <p><span>{'Ng\u01b0\u1eddi l\u1eadp b\u00e1o c\u00e1o:'}</span><strong>{currentUser?.name || 'Qu\u1ea3n tr\u1ecb vi\u00ean'}</strong></p>
          </section>

          {filters.reportType === 'business' ? (
            <>
              <section className="report-print-section">
                <h3>{'1. T\u1ed5ng quan kinh doanh'}</h3>
                <table>
                  <tbody>
                    {businessOverview.map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="report-print-section">
                <h3>{'2. Top s\u1ea3n ph\u1ea9m b\u00e1n ch\u1ea1y'}</h3>
                <table>
                  <thead>
                    <tr><th>STT</th><th>{'S\u1ea3n ph\u1ea9m'}</th><th>{'Danh m\u1ee5c'}</th><th>{'SL b\u00e1n'}</th><th>{'Doanh thu'}</th></tr>
                  </thead>
                  <tbody>
                    {(report.topProducts || []).map((product, index) => (
                      <tr key={product.productId || product.productName}>
                        <td>{index + 1}</td>
                        <td>{product.productName}</td>
                        <td>{product.categoryName || '-'}</td>
                        <td>{formatNumber(product.soldQuantity)}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : null}

          {filters.reportType === 'orders' ? (
            <>
              <section className="report-print-section">
                <h3>{'1. T\u1ed5ng quan \u0111\u01a1n h\u00e0ng'}</h3>
                <table>
                  <tbody>
                    {orderOverview.map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {orderStatusSummary.length ? (
                <section className="report-print-section">
                  <h3>{'2. \u0110\u01a1n h\u00e0ng theo tr\u1ea1ng th\u00e1i'}</h3>
                  <table>
                    <thead>
                      <tr><th>{'Tr\u1ea1ng th\u00e1i'}</th><th>{'S\u1ed1 l\u01b0\u1ee3ng'}</th></tr>
                    </thead>
                    <tbody>
                      {orderStatusSummary.map((item) => (
                        <tr key={item.status}>
                          <td>{item.label || orderStatusLabels[item.status] || item.status}</td>
                          <td>{formatNumber(item.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}

              <section className="report-print-section">
                <h3>{'3. \u0110\u01a1n h\u00e0ng g\u1ea7n \u0111\u00e2y'}</h3>
                <table>
                  <thead>
                    <tr><th>{'M\u00e3 \u0111\u01a1n'}</th><th>{'Kh\u00e1ch h\u00e0ng'}</th><th>{'Ng\u00e0y \u0111\u1eb7t'}</th><th>{'T\u1ed5ng ti\u1ec1n'}</th><th>{'Tr\u1ea1ng th\u00e1i'}</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customerName || '-'}</td>
                        <td>{order.orderDate || '-'}</td>
                        <td>{formatCurrency(order.total)}</td>
                        <td>{orderStatusLabels[order.status] || order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : null}

          {filters.reportType === 'inventory' ? (
            <>
              <section className="report-print-section">
                <h3>{'1. T\u1ed5ng quan t\u1ed3n kho'}</h3>
                <table>
                  <tbody>
                    {inventoryOverview.map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="report-print-section">
                <h3>{'2. C\u1ea3nh b\u00e1o t\u1ed3n kho'}</h3>
                <table>
                  <thead>
                    <tr><th>{'S\u1ea3n ph\u1ea9m'}</th><th>{'Bi\u1ebfn th\u1ec3'}</th><th>{'T\u1ed3n kho'}</th><th>{'Ng\u01b0\u1ee1ng'}</th><th>{'Tr\u1ea1ng th\u00e1i'}</th></tr>
                  </thead>
                  <tbody>
                    {(report.lowStockItems || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>{item.variant || 'M\u1eb7c \u0111\u1ecbnh'}</td>
                        <td>{formatNumber(item.stock)}</td>
                        <td>{formatNumber(item.warningLevel)}</td>
                        <td>{item.warningLabel || stockStatusLabels[item.warningStatus] || item.warningStatus || 'C\u1ea7n ki\u1ec3m tra'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="report-print-section">
                <h3>{'3. S\u1ea3n ph\u1ea9m s\u1eafp h\u1ebft h\u00e0ng'}</h3>
                <table>
                  <thead>
                    <tr><th>{'S\u1ea3n ph\u1ea9m'}</th><th>{'Bi\u1ebfn th\u1ec3'}</th><th>{'T\u1ed3n kho'}</th></tr>
                  </thead>
                  <tbody>
                    {(report.lowStockItems || []).filter((item) => Number(item.stock || 0) <= Number(item.warningLevel || 20)).map((item) => (
                      <tr key={`low-${item.id}`}>
                        <td>{item.productName}</td>
                        <td>{item.variant || 'M\u1eb7c \u0111\u1ecbnh'}</td>
                        <td>{formatNumber(item.stock)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : null}

          <footer className="report-signature">
            <div>
              <strong>{'Ng\u01b0\u1eddi l\u1eadp b\u00e1o c\u00e1o'}</strong>
              <span>{'K\u00fd, ghi r\u00f5 h\u1ecd t\u00ean'}</span>
            </div>
            <div>
              <strong>{'Qu\u1ea3n l\u00fd x\u00e1c nh\u1eadn'}</strong>
              <span>{'K\u00fd, ghi r\u00f5 h\u1ecd t\u00ean'}</span>
            </div>
          </footer>
        </article>
      </main>
    </div>
  )
}

export default ReportPrintPage
