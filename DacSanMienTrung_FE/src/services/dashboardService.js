import { getApi } from './apiClient'
import { normalizeOrderStatus } from './orderService'

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
  warningLevel: Number(item.mucCanhBao ?? item.warningLevel ?? 0),
  warningStatus: item.trangThaiCanhBao ?? item.warningStatus ?? '',
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

export const getAdminDashboard = async () => {
  return getApi('/dashboard/admin')
}
