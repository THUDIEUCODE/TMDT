const userStorageKey = 'dacsan_user'
const tokenStorageKey = 'dacsan_token'

const getPayload = (payload) => payload?.data ?? payload ?? {}

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

  return roleMap[normalizedRole] || roleMap[normalizedRole.toLowerCase()] || normalizedRole || null
}

export const getDefaultPathForRole = (role) => {
  const normalizedRole = normalizeUserRole(role)

  if (normalizedRole === 'quantrivien') {
    return '/admin/dashboard'
  }

  if (normalizedRole === 'nhanvien') {
    return '/staff/dashboard'
  }

  return '/profile'
}

export const canAccessPath = (role, path = '/') => {
  const normalizedRole = normalizeUserRole(role)
  const pathname = String(path || '/').split('?')[0]

  if (!normalizedRole) {
    return false
  }

  if (pathname.startsWith('/admin')) {
    return normalizedRole === 'quantrivien'
  }

  if (pathname.startsWith('/staff')) {
    return ['nhanvien', 'quantrivien'].includes(normalizedRole)
  }

  if (
    pathname === '/profile' ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname === '/payment' ||
    pathname === '/order-success' ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/')
  ) {
    return ['khachhang', 'nhanvien', 'quantrivien'].includes(normalizedRole)
  }

  return true
}

export const normalizeUser = (apiUser = {}) => {
  const user = getPayload(apiUser)
  const id = user.maNguoiDung ?? user.id ?? user.userId
  const role = normalizeUserRole(user.vaiTro ?? user.role ?? user.loaiTaiKhoan ?? 'khachhang')

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
    if (!storedUser) {
      return null
    }

    const user = normalizeUser(JSON.parse(storedUser))
    return user && (user.id || user.email || user.name) ? user : null
  } catch {
    return null
  }
}

export const getCurrentUserId = () => {
  const user = getCurrentUser()
  return user?.maNguoiDung ?? user?.id ?? null
}

export const getCurrentUserRole = () => {
  const user = getCurrentUser()
  return normalizeUserRole(user?.vaiTro ?? user?.role) || null
}

export const getToken = () => localStorage.getItem(tokenStorageKey) || ''

export const isLoggedIn = () => Boolean(getCurrentUser())

export const logout = () => {
  localStorage.removeItem(userStorageKey)
  localStorage.removeItem(tokenStorageKey)
  window.dispatchEvent(new Event('auth-changed'))
}
