import { deleteApi, getApi, postApi, putApi } from './apiClient'

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

export const discountTypeLabels = {
  phanTram: 'Phần trăm',
  soTien: 'Số tiền',
}

export const voucherStatusLabels = {
  active: 'Đang hoạt động',
  disabled: 'Đã tắt',
  expired: 'Hết hạn',
  outOfUses: 'Hết lượt dùng',
}

export const normalizeDiscountType = (type) => {
  const normalizedType = String(type || '').trim()
  const typeMap = {
    phanTram: 'phanTram',
    percent: 'phanTram',
    percentage: 'phanTram',
    soTien: 'soTien',
    fixed: 'soTien',
    amount: 'soTien',
  }

  return typeMap[normalizedType] || typeMap[normalizedType.toLowerCase()] || normalizedType
}

const normalizeBoolean = (value, fallback = false) => {
  if (value === true || value === false) {
    return value
  }

  if (value === 1 || value === '1' || value === 'true' || value === 'active') {
    return true
  }

  if (value === 0 || value === '0' || value === 'false' || value === 'disabled') {
    return false
  }

  return fallback
}

export const getVoucherStatus = (voucher = {}) => {
  if (voucher.statusKey) {
    return voucher.statusKey
  }

  const isEnabled = normalizeBoolean(voucher.trangThai ?? voucher.enabled, true)
  const isExpired = normalizeBoolean(voucher.hetHan ?? voucher.expired, false)
  const isActive = normalizeBoolean(voucher.dangHoatDong ?? voucher.active, false)
  const quantity = Number(voucher.soLuongTon ?? voucher.quantity ?? 0)

  if (!isEnabled) {
    return 'disabled'
  }

  if (isExpired) {
    return 'expired'
  }

  if (quantity === 0) {
    return 'outOfUses'
  }

  return isActive ? 'active' : 'disabled'
}

export const mapVoucherFromApi = (apiVoucher = {}) => {
  const voucher = getPayload(apiVoucher) || {}
  const id = voucher.maVoucher ?? voucher.id ?? voucher.voucherId ?? voucher.maCode ?? voucher.code
  const discountType = normalizeDiscountType(voucher.loaiGiam ?? voucher.discountType ?? voucher.type)
  const quantity = Number(voucher.soLuongTon ?? voucher.quantity ?? voucher.remainingUses ?? 0)
  const expired = normalizeBoolean(voucher.hetHan ?? voucher.expired, false)
  const active = normalizeBoolean(voucher.dangHoatDong ?? voucher.active, false)
  const enabled = normalizeBoolean(voucher.trangThai ?? voucher.enabled, true)
  const statusKey = getVoucherStatus({ ...voucher, quantity, expired, active, enabled })

  return {
    ...voucher,
    id: String(id ?? ''),
    maVoucher: id,
    code: voucher.maCode ?? voucher.code ?? '',
    maCode: voucher.maCode ?? voucher.code ?? '',
    discountType,
    discountTypeLabel: discountTypeLabels[discountType] || discountType || '-',
    discountValue: Number(voucher.giaTriGiam ?? voucher.discountValue ?? voucher.discount ?? 0),
    minOrderValue: Number(voucher.donHangToiThieu ?? voucher.minOrderValue ?? voucher.minimumOrder ?? 0),
    quantity,
    startDate: voucher.ngayBatDau ?? voucher.startDate ?? '',
    endDate: voucher.ngayHetHan ?? voucher.endDate ?? '',
    enabled,
    trangThai: enabled,
    expired,
    active,
    statusKey,
    status: voucherStatusLabels[statusKey] || voucher.status || statusKey,
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

export const getVouchers = async (filters = {}) => {
  const payload = await getApi(`/vouchers${buildQueryString(filters)}`)
  return getArrayPayload(payload).map(mapVoucherFromApi)
}

export const getActiveVouchers = async () => {
  const payload = await getApi('/vouchers/active')
  return getArrayPayload(payload).map(mapVoucherFromApi)
}

export const getVoucherById = async (maVoucher) => {
  const payload = await getApi(`/vouchers/${maVoucher}`)
  return mapVoucherFromApi(payload)
}

export const createVoucher = async (data) => {
  const payload = await postApi('/vouchers', data)
  return mapVoucherFromApi(payload)
}

export const updateVoucher = async (maVoucher, data) => {
  const payload = await putApi(`/vouchers/${maVoucher}`, data)
  return mapVoucherFromApi(payload)
}

export const toggleVoucher = async (maVoucher) => {
  const payload = await putApi(`/vouchers/${maVoucher}/toggle`)
  return mapVoucherFromApi(payload)
}

export const deleteVoucher = async (maVoucher) => {
  const payload = await deleteApi(`/vouchers/${maVoucher}`)
  return mapVoucherFromApi(payload)
}

export const applyVoucher = async (data) => {
  return postApi('/vouchers/apply', data)
}
