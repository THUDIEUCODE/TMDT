const userStorageKey = 'dacsan_user'
const tokenStorageKey = 'dacsan_token'

const getPayload = (payload) => payload?.data ?? payload ?? {}

export const normalizeUser = (apiUser = {}) => {
  const user = getPayload(apiUser)
  const id = user.maNguoiDung ?? user.id ?? user.userId
  const role = user.vaiTro ?? user.role ?? user.loaiTaiKhoan ?? 'khachhang'

  return {
    ...user,
    id: id !== undefined && id !== null ? String(id) : '',
    maNguoiDung: id,
    name: user.hoTen ?? user.name ?? user.tenNguoiDung ?? '',
    email: user.email ?? '',
    phone: user.soDienThoai ?? user.phone ?? '',
    birthday: user.ngaySinh ?? user.birthday ?? '',
    role,
    loyaltyPoints: Number(user.diemTichLuy ?? user.loyaltyPoints ?? 0),
    customerType: user.phanLoaiKhachHang ?? user.customerType ?? user.hangThanhVien ?? '',
    createdAt: user.ngayDangKy ?? user.createdAt ?? '',
  }
}

export const saveAuth = (loginResponse) => {
  const payload = getPayload(loginResponse)
  const token = payload.token ?? payload.accessToken ?? payload.jwt ?? ''
  const user = normalizeUser(payload.user ?? payload.nguoiDung ?? payload)

  if (token) {
    localStorage.setItem(tokenStorageKey, token)
  }

  localStorage.setItem(userStorageKey, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-changed'))

  return user
}

export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem(userStorageKey)
    return storedUser ? normalizeUser(JSON.parse(storedUser)) : null
  } catch {
    return null
  }
}

export const getCurrentUserId = () => {
  const user = getCurrentUser()
  return user?.maNguoiDung ?? user?.id ?? null
}

export const getToken = () => localStorage.getItem(tokenStorageKey) || ''

export const isLoggedIn = () => Boolean(getCurrentUser())

export const logout = () => {
  localStorage.removeItem(userStorageKey)
  localStorage.removeItem(tokenStorageKey)
  window.dispatchEvent(new Event('auth-changed'))
}
