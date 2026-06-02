import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload ?? {}

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

export const roleLabels = {
  khachhang: 'Khách hàng',
  nhanvien: 'Nhân viên',
  quantrivien: 'Quản trị viên',
}

export const statusLabels = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
}

export const normalizeUserRole = (role) => {
  const normalizedRole = String(role || '').trim()
  const roleMap = {
    customer: 'khachhang',
    khachHang: 'khachhang',
    khachhang: 'khachhang',
    KHACHHANG: 'khachhang',
    staff: 'nhanvien',
    nhanVien: 'nhanvien',
    nhanvien: 'nhanvien',
    NHANVIEN: 'nhanvien',
    admin: 'quantrivien',
    quanTriVien: 'quantrivien',
    quantrivien: 'quantrivien',
    QUANTRIVIEN: 'quantrivien',
  }

  return roleMap[normalizedRole] || roleMap[normalizedRole.toLowerCase()] || normalizedRole || 'khachhang'
}

export const normalizeUserStatus = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'active' : 'locked'
  }

  const normalizedStatus = String(status || '').trim()
  const statusMap = {
    true: 'active',
    false: 'locked',
    active: 'active',
    locked: 'locked',
    dangHoatDong: 'active',
    daKhoa: 'locked',
    DANGHOATDONG: 'active',
    DAKHOA: 'locked',
  }

  return statusMap[normalizedStatus] || statusMap[normalizedStatus.toLowerCase()] || 'active'
}

export const mapUserFromApi = (apiUser = {}) => {
  const user = getPayload(apiUser)
  const role = normalizeUserRole(user.vaiTro ?? user.role)
  const status = normalizeUserStatus(user.trangThai ?? user.status)

  return {
    ...user,
    id: String(user.maNguoiDung ?? user.id ?? ''),
    maNguoiDung: user.maNguoiDung ?? user.id,
    fullName: user.hoTen ?? user.fullName ?? user.name ?? '',
    name: user.hoTen ?? user.fullName ?? user.name ?? '',
    email: user.email ?? '',
    phone: user.soDienThoai ?? user.phone ?? '',
    birthday: user.ngaySinh ?? user.birthday ?? '',
    role,
    roleLabel: roleLabels[role] ?? role,
    status,
    statusLabel: statusLabels[status] ?? status,
    points: Number(user.diemTichLuy ?? user.points ?? user.loyaltyPoints ?? 0),
    customerRank: user.phanLoaiKhachHang ?? user.customerRank ?? '',
    position: user.chucVu ?? user.position ?? '',
    createdAt: user.ngayDangKy ?? user.createdAt ?? '',
  }
}

const mapUsersFromPayload = (payload) => getArrayPayload(payload).map(mapUserFromApi)

const createQuery = (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.role && filters.role !== 'all') {
    params.set('role', filters.role)
  }

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }

  if (filters.keyword) {
    params.set('keyword', filters.keyword)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const getUsers = async (filters = {}) => {
  const payload = await getApi(`/admin/users${createQuery(filters)}`)
  return mapUsersFromPayload(payload)
}

export const getUserById = async (maNguoiDung) => {
  const payload = await getApi(`/admin/users/${maNguoiDung}`)
  return mapUserFromApi(payload)
}

export const createUser = async (data) => {
  const payload = await postApi('/admin/users', data)
  return mapUserFromApi(payload)
}

export const updateUser = async (maNguoiDung, data) => {
  const payload = await putApi(`/admin/users/${maNguoiDung}`, data)
  return mapUserFromApi(payload)
}

export const lockUser = async (maNguoiDung) => {
  const payload = await putApi(`/admin/users/${maNguoiDung}/lock`)
  return mapUserFromApi(payload)
}

export const unlockUser = async (maNguoiDung) => {
  const payload = await putApi(`/admin/users/${maNguoiDung}/unlock`)
  return mapUserFromApi(payload)
}

export const changeUserRole = async (maNguoiDung, data) => {
  const payload = await putApi(`/admin/users/${maNguoiDung}/role`, data)
  return mapUserFromApi(payload)
}

export const deleteUser = async (maNguoiDung) => {
  const payload = await deleteApi(`/admin/users/${maNguoiDung}`)
  return payload ? mapUserFromApi(payload) : null
}
