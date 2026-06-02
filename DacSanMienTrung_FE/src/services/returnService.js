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

const legacyStatusMap = {
  pending: 'choDuyet',
  approved: 'daDuyet',
  rejected: 'tuChoi',
  refunded: 'daHoanTien',
}

export const returnStatusLabels = {
  khongCo: 'Không có',
  choDuyet: 'Chờ duyệt',
  daDuyet: 'Đã duyệt',
  tuChoi: 'Từ chối',
  daHoanTien: 'Đã hoàn tiền',
}

export const returnStatusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'choDuyet', label: returnStatusLabels.choDuyet },
  { value: 'daDuyet', label: returnStatusLabels.daDuyet },
  { value: 'tuChoi', label: returnStatusLabels.tuChoi },
  { value: 'daHoanTien', label: returnStatusLabels.daHoanTien },
]

export const normalizeReturnStatus = (status) => legacyStatusMap[status] || status || 'khongCo'

const mapReturnItemFromApi = (item = {}) => {
  const productName = item.tenSanPham ?? item.name ?? 'Sản phẩm'
  const quantity = Number(item.soLuong ?? item.quantity ?? 0)
  const returnQuantity = Number(item.soLuongHoan ?? item.returnQuantity ?? item.quantity ?? 0)
  const refundPrice = Number(item.donGiaHoan ?? item.refundPrice ?? item.donGia ?? item.price ?? 0)

  return {
    ...item,
    id: String(item.maChiTietDonHang ?? item.id ?? `${productName}-${returnQuantity}`),
    orderItemId: item.maChiTietDonHang ?? item.orderItemId ?? item.id,
    variantId: item.maBienThe ?? item.variantId ?? '',
    productId: item.maSanPham ?? item.productId ?? '',
    name: productName,
    image: item.hinhAnh ?? item.image ?? '',
    variant:
      item.variant ||
      item.tenBienThe ||
      [item.trongLuong, item.quyCachDongGoi].filter(Boolean).join(' - ') ||
      'Mặc định',
    quantity,
    returnQuantity,
    price: Number(item.donGia ?? item.price ?? refundPrice),
    refundPrice,
    refundTotal: Number(item.thanhTienHoan ?? item.refundTotal ?? refundPrice * returnQuantity),
  }
}

export const mapReturnFromApi = (apiReturn = {}) => {
  const returnRequest = getPayload(apiReturn) || {}
  const orderId = returnRequest.maDonHang ?? returnRequest.orderId ?? returnRequest.id
  const items = getArrayPayload(returnRequest.items ?? returnRequest.chiTietDonHang ?? returnRequest.returnItems).map(mapReturnItemFromApi)
  const estimatedRefund = Number(
    returnRequest.tongTienHoanDuKien ??
      returnRequest.estimatedRefund ??
      returnRequest.refundTotal ??
      items.reduce((total, item) => total + item.refundTotal, 0),
  )

  return {
    ...returnRequest,
    id: String(returnRequest.id ?? returnRequest.maYeuCauHoanHang ?? orderId ?? ''),
    orderId: String(orderId ?? ''),
    customerId: returnRequest.maNguoiDung ?? returnRequest.customerId ?? '',
    customerName: returnRequest.hoTenNguoiNhan ?? returnRequest.customerName ?? '',
    phone: returnRequest.soDienThoaiNguoiNhan ?? returnRequest.phone ?? '',
    address: returnRequest.diaChiGiaoHang ?? returnRequest.address ?? '',
    orderDate: returnRequest.ngayDatHang ?? returnRequest.orderDate ?? returnRequest.requestDate ?? '',
    orderTotal: Number(returnRequest.tongThanhToan ?? returnRequest.orderTotal ?? 0),
    orderStatus: returnRequest.trangThaiDonHang ?? returnRequest.orderStatus ?? '',
    returnReason: returnRequest.lyDoHoanHang ?? returnRequest.returnReason ?? returnRequest.description ?? '',
    proofImage: returnRequest.hinhAnhMinhChung ?? returnRequest.proofImage ?? '',
    returnStatus: normalizeReturnStatus(returnRequest.trangThaiHoanHang ?? returnRequest.returnStatus ?? returnRequest.status),
    staffId: returnRequest.maNhanVienXuLy ?? returnRequest.staffId ?? '',
    staffNote: returnRequest.ghiChuXuLy ?? returnRequest.staffNote ?? returnRequest.handlingNote ?? '',
    estimatedRefund,
    items,
  }
}

export const createReturnRequest = async (data) => {
  return postApi('/returns', data)
}

export const getReturns = async (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }

  if (filters.keyword) {
    params.set('keyword', filters.keyword)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const payload = await getApi(`/returns${query}`)
  return getArrayPayload(payload).map(mapReturnFromApi)
}

export const getReturnByOrderId = async (maDonHang) => {
  const payload = await getApi(`/returns/${maDonHang}`)
  return mapReturnFromApi(payload)
}

export const approveReturn = async (maDonHang, data) => {
  const payload = await putApi(`/returns/${maDonHang}/approve`, data)
  return mapReturnFromApi(payload)
}

export const rejectReturn = async (maDonHang, data) => {
  const payload = await putApi(`/returns/${maDonHang}/reject`, data)
  return mapReturnFromApi(payload)
}

export const refundReturn = async (maDonHang, data) => {
  const payload = await putApi(`/returns/${maDonHang}/refund`, data)
  return mapReturnFromApi(payload)
}
