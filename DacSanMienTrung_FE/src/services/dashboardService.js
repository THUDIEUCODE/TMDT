import { getApi } from './apiClient'
import { normalizeOrderStatus, orderStatusLabels } from './orderService'

const getPayload = (payload) => payload?.data ?? payload ?? {}

const getArrayPayload = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (Array.isArray(value?.data)) {
    return value.data
  }

  if (Array.isArray(value?.content)) {
    return value.content
  }

  return []
}

const getStatusStatPayload = (value) => {
  const arrayPayload = getArrayPayload(value)

  if (arrayPayload.length) {
    return arrayPayload
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).map(([status, count]) => ({ status, count }))
  }

  return []
}

const mapRecentOrder = (order = {}) => ({
  id: String(order.maDonHang ?? order.id ?? order.code ?? ''),
  customerName: order.hoTenNguoiNhan ?? order.customerName ?? order.receiverName ?? '',
  phone: order.soDienThoaiNguoiNhan ?? order.phone ?? order.receiverPhone ?? '',
  orderDate: order.ngayDatHang ?? order.orderDate ?? order.createdAt ?? '',
  total: Number(order.tongThanhToan ?? order.total ?? 0),
  status: normalizeOrderStatus(order.trangThaiDonHang ?? order.trangThai ?? order.status),
  paymentMethod: order.phuongThucThanhToan ?? order.paymentMethod ?? '',
})

const mapLowStockItem = (item = {}) => ({
  id: String(item.maBienThe ?? item.id ?? `${item.maSanPham ?? 'product'}-${item.trongLuong ?? 'variant'}`),
  productId: String(item.maSanPham ?? item.productId ?? ''),
  variantId: String(item.maBienThe ?? item.variantId ?? ''),
  productName: item.tenSanPham ?? item.productName ?? item.name ?? 'Sản phẩm',
  variant:
    item.variant ||
    item.variantName ||
    [item.trongLuong, item.quyCachDongGoi].filter(Boolean).join(' - ') ||
    'Mặc định',
  stock: Number(item.soLuongTon ?? item.stock ?? 0),
  warningLevel: Number(item.mucCanhBao ?? item.nguongCanhBao ?? item.warningLevel ?? 0),
  warningStatus: item.trangThaiTonKho ?? item.trangThaiCanhBao ?? item.warningStatus ?? '',
  warningLabel: item.nhanTrangThaiTonKho ?? item.nhanTrangThaiCanhBao ?? item.warningLabel ?? '',
})

const mapRevenueByDay = (item = {}) => ({
  date: item.ngay ?? item.date ?? '',
  label: item.nhanNgay ?? item.label ?? item.ngay ?? item.date ?? '',
  revenue: Number(item.doanhThu ?? item.revenue ?? 0),
})

const mapOrderStatusStat = (item = {}) => {
  const status = normalizeOrderStatus(item.trangThai ?? item.status)

  return {
    status,
    label: item.nhanTrangThai ?? item.label ?? orderStatusLabels[status] ?? status,
    count: Number(item.soLuong ?? item.count ?? 0),
  }
}

const mapTopProduct = (product = {}) => ({
  productId: String(product.maSanPham ?? product.productId ?? product.id ?? ''),
  productName: product.tenSanPham ?? product.productName ?? product.name ?? 'Sản phẩm',
  categoryName: product.tenDanhMuc ?? product.categoryName ?? product.category ?? '',
  soldQuantity: Number(product.soLuongBan ?? product.tongSoLuongBan ?? product.soLuongDaBan ?? product.soldQuantity ?? product.sold ?? 0),
  revenue: Number(product.doanhThu ?? product.revenue ?? 0),
})

export const mapStaffDashboardFromApi = (apiDashboard = {}) => {
  const dashboard = getPayload(apiDashboard)

  return {
    totalTodayOrders: Number(dashboard.tongDonHomNay ?? dashboard.totalTodayOrders ?? 0),
    pendingOrders: Number(dashboard.donChoXacNhan ?? dashboard.pendingOrders ?? 0),
    shippingOrders: Number(dashboard.donDangGiao ?? dashboard.shippingOrders ?? 0),
    todayRevenue: Number(dashboard.doanhThuHomNay ?? dashboard.todayRevenue ?? 0),
    lowStockCount: Number(dashboard.sanPhamSapHetHang ?? dashboard.lowStockCount ?? 0),
    pendingReturns: Number(dashboard.yeuCauHoanHangChoXuLy ?? dashboard.pendingReturns ?? 0),
    pendingReviews: Number(dashboard.danhGiaChoDuyet ?? dashboard.pendingReviews ?? 0),
    recentOrders: getArrayPayload(dashboard.donHangMoiNhat ?? dashboard.recentOrders).map(mapRecentOrder),
    lowStockItems: getArrayPayload(dashboard.canhBaoTonKho ?? dashboard.lowStockItems).map(mapLowStockItem),
  }
}

export const getStaffDashboard = async () => {
  const payload = await getApi('/dashboard/staff')
  return mapStaffDashboardFromApi(payload)
}

export const mapAdminDashboardFromApi = (apiDashboard = {}) => {
  const dashboard = getPayload(apiDashboard)

  return {
    totalRevenue: Number(dashboard.tongDoanhThu ?? dashboard.totalRevenue ?? 0),
    totalOrders: Number(dashboard.tongDonHang ?? dashboard.totalOrders ?? 0),
    totalCustomers: Number(dashboard.tongKhachHang ?? dashboard.totalCustomers ?? 0),
    totalProducts: Number(dashboard.tongSanPham ?? dashboard.totalProducts ?? 0),
    pendingOrders: Number(dashboard.donChoXuLy ?? dashboard.pendingOrders ?? 0),
    activeVouchers: Number(dashboard.voucherDangHoatDong ?? dashboard.activeVouchers ?? 0),
    monthlyRevenue: Number(dashboard.doanhThuThangNay ?? dashboard.monthlyRevenue ?? 0),
    lockedAccounts: Number(dashboard.taiKhoanBiKhoa ?? dashboard.lockedAccounts ?? 0),
    revenueLast7Days: getArrayPayload(dashboard.doanhThu7NgayGanNhat ?? dashboard.revenueLast7Days).map(mapRevenueByDay),
    ordersByStatus: getStatusStatPayload(dashboard.donHangTheoTrangThai ?? dashboard.ordersByStatus).map(mapOrderStatusStat),
    topProducts: getArrayPayload(dashboard.topSanPhamBanChay ?? dashboard.topProducts).map(mapTopProduct),
    recentOrders: getArrayPayload(dashboard.donHangGanDay ?? dashboard.recentOrders).map(mapRecentOrder),
    lowStockItems: getArrayPayload(dashboard.canhBaoTonKho ?? dashboard.lowStockItems).map(mapLowStockItem),
  }
}

export const getAdminDashboard = async () => {
  const payload = await getApi('/dashboard/admin')
  return mapAdminDashboardFromApi(payload)
}
