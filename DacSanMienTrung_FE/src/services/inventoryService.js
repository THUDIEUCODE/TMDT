import { resolveProductImage } from '../utils/imageUtils'
import { getApi, putApi } from './apiClient'

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

const getPayload = (payload) => payload?.data ?? payload ?? {}

const createInitials = (value) =>
  String(value || 'SP')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

export const inventoryStatusLabels = {
  all: 'Tất cả',
  conHang: 'Còn hàng',
  canNhapThem: 'Cần nhập thêm',
  ratThap: 'Rất thấp',
  hetHang: 'Hết hàng',
}

export const variantStatusLabels = {
  all: 'Tất cả',
  active: 'Đang bán',
  hidden: 'Tạm ẩn',
}

export const normalizeInventoryStatus = (stock) => {
  const normalizedStock = Number(stock || 0)

  if (normalizedStock === 0) {
    return 'hetHang'
  }

  if (normalizedStock <= 10) {
    return 'ratThap'
  }

  if (normalizedStock <= 20) {
    return 'canNhapThem'
  }

  return 'conHang'
}

export const normalizeVariantStatus = (status) =>
  status === false || status === 'false' || status === 'hidden' || status === 0 ? 'hidden' : 'active'

export const mapInventoryFromApi = (apiInventory = {}) => {
  const inventory = getPayload(apiInventory)
  const variantId = inventory.maBienThe ?? inventory.variantId ?? inventory.id
  const productName = inventory.tenSanPham ?? inventory.productName ?? ''
  const stock = Number(inventory.soLuongTon ?? inventory.stock ?? 0)
  const inventoryStatus = inventory.trangThaiTonKho ?? inventory.inventoryStatus ?? normalizeInventoryStatus(stock)
  const variantStatusValue = inventory.trangThaiBienThe ?? inventory.variantStatus ?? inventory.status
  const rawImage = inventory.hinhAnhBienThe ?? inventory.hinhAnhSanPham ?? inventory.image ?? inventory.productImage ?? inventory.variantImage ?? ''

  return {
    ...inventory,
    id: String(variantId ?? ''),
    variantId: String(variantId ?? ''),
    productId: String(inventory.maSanPham ?? inventory.productId ?? ''),
    productName,
    categoryId: String(inventory.maDanhMuc ?? inventory.categoryId ?? ''),
    categoryName: inventory.tenDanhMuc ?? inventory.categoryName ?? 'Đang cập nhật',
    province: inventory.tenTinh ?? inventory.province ?? '',
    region: inventory.vungMien ?? inventory.region ?? '',
    productImage: inventory.hinhAnhSanPham ?? inventory.productImage ?? '',
    variantImage: inventory.hinhAnhBienThe ?? inventory.variantImage ?? '',
    image: resolveProductImage(productName, rawImage) || createInitials(productName),
    weight: inventory.trongLuong ?? inventory.weight ?? '',
    packaging: inventory.quyCachDongGoi ?? inventory.packaging ?? '',
    price: Number(inventory.giaBan ?? inventory.price ?? 0),
    stock,
    expiryDate: inventory.hanSuDung ?? inventory.expiryDate ?? '',
    variantStatus: normalizeVariantStatus(variantStatusValue),
    inventoryStatus,
    inventoryStatusLabel:
      inventory.nhanTrangThaiTonKho ??
      inventory.inventoryStatusLabel ??
      inventoryStatusLabels[inventoryStatus] ??
      inventoryStatus,
  }
}

export const mapInventorySummaryFromApi = (apiSummary = {}) => {
  const summary = getPayload(apiSummary)

  return {
    totalVariants: Number(summary.tongBienThe ?? summary.totalVariants ?? 0),
    totalStock: Number(summary.tongTonKho ?? summary.totalStock ?? 0),
    outOfStock: Number(summary.hetHang ?? summary.outOfStock ?? 0),
    veryLow: Number(summary.ratThap ?? summary.veryLow ?? 0),
    needImport: Number(summary.canNhapThem ?? summary.needImport ?? 0),
    inStock: Number(summary.conHang ?? summary.inStock ?? 0),
  }
}

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const getInventory = async (filters = {}) => {
  const payload = await getApi(`/inventory${buildQueryString(filters)}`)
  return getArrayPayload(payload).map(mapInventoryFromApi)
}

export const getInventorySummary = async () => {
  const payload = await getApi('/inventory/summary')
  return mapInventorySummaryFromApi(payload)
}

export const getInventoryByVariantId = async (maBienThe) => {
  const payload = await getApi(`/inventory/${maBienThe}`)
  return mapInventoryFromApi(payload)
}

export const updateStock = async (maBienThe, data) => {
  const payload = await putApi(`/inventory/${maBienThe}/stock`, data)
  return mapInventoryFromApi(payload)
}

export const importStock = async (maBienThe, data) => {
  const payload = await putApi(`/inventory/${maBienThe}/import`, data)
  return mapInventoryFromApi(payload)
}
