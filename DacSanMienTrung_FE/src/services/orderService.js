import { getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.data?.content)) {
    return payload.data.content
  }

  if (Array.isArray(payload?.content)) {
    return payload.content
  }

  return []
}

export const orderStatusLabels = {
  choXacNhan: 'Chờ xác nhận',
  daXacNhan: 'Đã xác nhận',
  dangGiao: 'Đang giao',
  khachDaNhan: 'Khách đã nhận hàng',
  daGiao: 'Đã giao',
  daHuy: 'Đã hủy',
  dangHoanHang: 'Đang hoàn hàng',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  customerReceived: 'Khách đã nhận hàng',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
  returning: 'Đang hoàn hàng',
}

export const orderStatusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'choXacNhan', label: orderStatusLabels.choXacNhan },
  { value: 'daXacNhan', label: orderStatusLabels.daXacNhan },
  { value: 'dangGiao', label: orderStatusLabels.dangGiao },
  { value: 'khachDaNhan', label: orderStatusLabels.khachDaNhan },
  { value: 'daGiao', label: orderStatusLabels.daGiao },
  { value: 'daHuy', label: orderStatusLabels.daHuy },
  { value: 'dangHoanHang', label: orderStatusLabels.dangHoanHang },
]

export const normalizeOrderStatus = (status) => {
  const statusMap = {
    pending: 'choXacNhan',
    confirmed: 'daXacNhan',
    shipping: 'dangGiao',
    customerReceived: 'khachDaNhan',
    completed: 'daGiao',
    cancelled: 'daHuy',
    returning: 'dangHoanHang',
  }

  return statusMap[status] || status || 'choXacNhan'
}

export const paymentStatusLabels = {
  choThanhToan: 'Chờ thanh toán',
  thanhCong: 'Thanh toán thành công',
  thatBai: 'Thanh toán thất bại',
}

export const paymentMethodLabels = {
  COD: 'Thanh toán khi nhận hàng',
  chuyenKhoan: 'Chuyển khoản ngân hàng',
  vi: 'Ví điện tử',
}

const createInitials = (value) =>
  String(value || 'SP')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

const mapOrderItemFromApi = (item = {}) => {
  const productName = item.tenSanPham ?? item.name ?? 'Sản phẩm'
  const price = Number(item.donGia ?? item.price ?? 0)
  const quantity = Number(item.soLuong ?? item.quantity ?? 1)

  return {
    ...item,
    id: String(item.maChiTietDonHang ?? item.id ?? `${productName}-${quantity}`),
    orderItemId: String(item.maChiTietDonHang ?? item.orderItemId ?? item.id ?? ''),
    maChiTietDonHang: item.maChiTietDonHang ?? item.orderItemId ?? item.id,
    productId: String(item.maSanPham ?? item.productId ?? ''),
    variantId: String(item.maBienThe ?? item.variantId ?? ''),
    name: productName,
    image: item.hinhAnh || item.image || createInitials(productName),
    variant:
      item.variant ||
      item.variantName ||
      item.tenBienThe ||
      [item.trongLuong, item.quyCachDongGoi].filter(Boolean).join(' - ') ||
      'Mặc định',
    quantity,
    price,
    total: Number(item.thanhTien ?? item.total ?? price * quantity),
    rating: item.soSao ?? item.rating ?? null,
    reviewContent: item.noiDungDanhGia ?? item.reviewContent ?? '',
    reviewDate: item.ngayDanhGia ?? item.reviewDate ?? '',
    reviewApproved: Boolean(item.daKiemDuyetDanhGia ?? item.reviewApproved ?? false),
    daKiemDuyetDanhGia: Boolean(item.daKiemDuyetDanhGia ?? item.reviewApproved ?? false),
  }
}

export const mapOrderFromApi = (apiOrder = {}) => {
  const order = getPayload(apiOrder) || {}
  const id = order.maDonHang ?? order.id ?? order.code
  const items = getArrayPayload(order.chiTietDonHang ?? order.chiTietDonHangs ?? order.items ?? order.orderItems).map(mapOrderItemFromApi)
  const subtotal = Number(order.tongTienHang ?? order.subtotal ?? items.reduce((sum, item) => sum + item.total, 0))
  const shippingFee = Number(order.phiVanChuyen ?? order.shippingFee ?? 0)
  const discount = Number(order.tienGiam ?? order.discount ?? 0)
  const total = Number(order.tongThanhToan ?? order.total ?? Math.max(subtotal - discount + shippingFee, 0))
  const voucherId = order.maVoucher ?? order.voucherId ?? null
  const voucherCode = order.maCodeVoucher ?? order.voucherCode ?? order.maCode ?? ''
  const address =
    order.diaChiGiaoHang ||
    order.shippingAddress ||
    [order.diaChi, order.quanHuyen, order.tinhThanhGiaoHang].filter(Boolean).join(', ')

  return {
    ...order,
    id: String(id ?? ''),
    code: String(order.maDonHang ?? order.code ?? id ?? ''),
    orderDate: order.ngayDatHang ?? order.orderDate ?? order.createdAt ?? '',
    status: normalizeOrderStatus(order.trangThaiDonHang ?? order.trangThai ?? order.status),
    paymentStatus: order.trangThaiThanhToan ?? order.paymentStatus ?? '',
    customerName: order.hoTenNguoiNhan ?? order.customerName ?? order.receiverName ?? '',
    phone: order.soDienThoaiNguoiNhan ?? order.phone ?? order.receiverPhone ?? '',
    receiverName: order.hoTenNguoiNhan ?? order.receiverName ?? order.customerName ?? '',
    receiverPhone: order.soDienThoaiNguoiNhan ?? order.receiverPhone ?? order.phone ?? '',
    shippingAddress: address,
    address,
    district: order.quanHuyen ?? order.district ?? '',
    province: order.tinhThanhGiaoHang ?? order.province ?? '',
    paymentMethod: order.phuongThucThanhToan ?? order.paymentMethod ?? 'COD',
    transactionCode: order.maGiaoDich ?? order.transactionCode ?? '',
    paidAt: order.ngayThanhToan ?? order.paidAt ?? '',
    processedBy: order.maNhanVienXuLy ?? order.nhanVienXuLy ?? order.processedBy ?? '',
    processingNote: order.ghiChuXuLy ?? order.processingNote ?? '',
    note: order.ghiChuGiaoHang ?? order.ghiChu ?? order.note ?? '',
    voucherId,
    maVoucher: voucherId,
    voucherCode,
    maCodeVoucher: voucherCode,
    cancelReason: order.lyDoHuy ?? order.cancelReason ?? '',
    returnReason: order.lyDoHoanHang ?? order.returnReason ?? '',
    returnStatus: order.trangThaiHoanHang ?? order.returnStatus ?? 'khongCo',
    subtotal,
    shippingFee,
    discount,
    total,
    itemCount: Number(order.soLuongSanPham ?? order.itemCount ?? items.length),
    items,
  }
}

export const createOrder = async (data) => {
  const payload = await postApi('/orders', data)
  return mapOrderFromApi(payload)
}

export const getOrderById = async (maDonHang) => {
  const payload = await getApi(`/orders/${maDonHang}`)
  return mapOrderFromApi(payload)
}

export const getAllOrders = async (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }

  if (filters.keyword) {
    params.set('keyword', filters.keyword)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const payload = await getApi(`/orders${query}`)
  return getArrayPayload(payload).map(mapOrderFromApi)
}

export const getOrdersByUser = async (maNguoiDung, status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const payload = await getApi(`/orders/user/${maNguoiDung}${query}`)
  return getArrayPayload(payload).map(mapOrderFromApi)
}

export const updateOrderStatus = async (maDonHang, status) => {
  const payload = await putApi(`/orders/${maDonHang}/status?status=${encodeURIComponent(status)}`)
  return mapOrderFromApi(payload)
}

export const cancelOrder = async (maDonHang, data) => {
  const payload = await putApi(`/orders/${maDonHang}/cancel`, data)
  return mapOrderFromApi(payload)
}

export const confirmReceived = async (maDonHang, data) => {
  const payload = await putApi(`/orders/${maDonHang}/confirm-received`, data)
  return mapOrderFromApi(payload)
}

export const confirmBankTransfer = async (maDonHang, data) => {
  const payload = await putApi(`/orders/${maDonHang}/confirm-bank-transfer`, data)
  return mapOrderFromApi(payload)
}

export const confirmWalletPayment = async (maDonHang, data) => {
  const payload = await putApi(`/orders/${maDonHang}/confirm-wallet-payment`, data)
  return mapOrderFromApi(payload)
}
