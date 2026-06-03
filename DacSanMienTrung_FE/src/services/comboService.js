import { resolveProductImage } from '../utils/imageUtils'
import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.content)) return payload.data.content
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

export const comboStatusLabels = {
  luuTam: 'Lưu tạm',
  daDatHang: 'Đã đặt hàng',
  daHuy: 'Đã hủy',
}

export const pendingComboStorageKeys = {
  id: 'dacsan_pending_combo_id',
  name: 'dacsan_pending_combo_name',
  message: 'dacsan_pending_combo_message',
}

export const getPendingCombo = () => ({
  id: localStorage.getItem(pendingComboStorageKeys.id) || '',
  name: localStorage.getItem(pendingComboStorageKeys.name) || '',
  message: localStorage.getItem(pendingComboStorageKeys.message) || '',
})

export const setPendingCombo = (combo) => {
  localStorage.setItem(pendingComboStorageKeys.id, String(combo.id || combo.maCombo || ''))
  localStorage.setItem(pendingComboStorageKeys.name, combo.name || combo.tenCombo || '')
  localStorage.setItem(pendingComboStorageKeys.message, combo.message || combo.loiNhan || '')
}

export const clearPendingCombo = () => {
  Object.values(pendingComboStorageKeys).forEach((key) => localStorage.removeItem(key))
}

export const mapComboItemFromApi = (item = {}) => {
  const id = item.maChiTietCombo ?? item.id ?? item.comboItemId
  const variantId = item.maBienThe ?? item.variantId ?? ''
  const productName = item.tenSanPham ?? item.productName ?? item.name ?? 'Sản phẩm'
  const variantName =
    item.tenBienThe ||
    item.variantName ||
    item.variantLabel ||
    [item.trongLuong, item.quyCachDongGoi].filter(Boolean).join(' - ') ||
    'Mặc định'
  const quantity = Number(item.soLuong ?? item.quantity ?? 1)
  const price = Number(item.donGia ?? item.giaBan ?? item.price ?? 0)
  const rawImage =
    item.hinhAnh ??
    item.hinhAnhSanPham ??
    item.hinhAnhBienThe ??
    item.image ??
    item.productImage ??
    item.variantImage ??
    ''

  return {
    ...item,
    id: String(id ?? `${variantId}-${productName}`),
    maChiTietCombo: id,
    maBienThe: variantId,
    variantId: String(variantId),
    productName,
    name: productName,
    variantName,
    quantity,
    soLuong: quantity,
    price,
    note: item.ghiChu ?? item.note ?? '',
    image: resolveProductImage(productName, rawImage) || productName.slice(0, 2).toUpperCase(),
    total: Number(item.thanhTien ?? item.total ?? price * quantity),
  }
}

export const mapComboFromApi = (apiCombo = {}) => {
  const combo = getPayload(apiCombo) || {}
  const id = combo.maCombo ?? combo.id
  const rawItems = combo.items ?? combo.chiTietCombos ?? combo.comboItems ?? combo.danhSachSanPham ?? []
  const items = getArrayPayload(rawItems).map(mapComboItemFromApi)
  const total = Number(
    combo.tongTien ??
      combo.total ??
      items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
  )

  return {
    ...combo,
    id: String(id ?? ''),
    maCombo: id,
    name: combo.tenCombo ?? combo.name ?? 'Combo quà tặng',
    tenCombo: combo.tenCombo ?? combo.name ?? 'Combo quà tặng',
    type: combo.loaiCombo ?? combo.type ?? '',
    loaiCombo: combo.loaiCombo ?? combo.type ?? '',
    occasion: combo.dipLe ?? combo.occasion ?? '',
    dipLe: combo.dipLe ?? combo.occasion ?? '',
    message: combo.loiNhan ?? combo.message ?? '',
    loiNhan: combo.loiNhan ?? combo.message ?? '',
    status: combo.trangThaiCombo ?? combo.status ?? 'luuTam',
    trangThaiCombo: combo.trangThaiCombo ?? combo.status ?? 'luuTam',
    createdAt: combo.ngayTao ?? combo.createdAt ?? '',
    total,
    tongTien: total,
    items,
  }
}

export const createCombo = async (data) => mapComboFromApi(await postApi('/combos', data))

export const getCombosByUser = async (maNguoiDung, status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const payload = await getApi(`/combos/user/${maNguoiDung}${query}`)
  return getArrayPayload(payload).map(mapComboFromApi)
}

export const getComboById = async (maCombo) => mapComboFromApi(await getApi(`/combos/${maCombo}`))

export const updateCombo = async (maCombo, data) => mapComboFromApi(await putApi(`/combos/${maCombo}`, data))

export const addComboItem = async (maCombo, data) => mapComboItemFromApi(await postApi(`/combos/${maCombo}/items`, data))

export const updateComboItem = async (maChiTietCombo, data) =>
  mapComboItemFromApi(await putApi(`/combos/items/${maChiTietCombo}`, data))

export const deleteComboItem = async (maChiTietCombo) => deleteApi(`/combos/items/${maChiTietCombo}`)

export const cancelCombo = async (maCombo) => {
  const payload = await putApi(`/combos/${maCombo}/cancel`)
  return payload ? mapComboFromApi(payload) : null
}

export const markComboOrdered = async (maCombo) => {
  const payload = await putApi(`/combos/${maCombo}/mark-ordered`)
  return payload ? mapComboFromApi(payload) : null
}
