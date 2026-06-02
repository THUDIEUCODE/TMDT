import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockUsers } from '../../data/mockUsers'
import {
  changeUserRole,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  lockUser,
  mapUserFromApi,
  normalizeUserRole,
  normalizeUserStatus,
  roleLabels,
  statusLabels,
  unlockUser,
  updateUser,
} from '../../services/userService'
import './AccountManagementPage.css'

const roleOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'khachhang', label: roleLabels.khachhang },
  { value: 'nhanvien', label: roleLabels.nhanvien },
  { value: 'quantrivien', label: roleLabels.quantrivien },
]

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: statusLabels.active },
  { value: 'locked', label: statusLabels.locked },
]

const emptyForm = {
  hoTen: '',
  email: '',
  matKhau: '',
  soDienThoai: '',
  ngaySinh: '',
  vaiTro: 'khachhang',
  trangThai: 'active',
  phanLoaiKhachHang: '',
  chucVu: '',
}

const getUserKey = (user) => user.maNguoiDung ?? user.id

const createInitial = (value) =>
  String(value || 'TK')
    .trim()
    .charAt(0)
    .toUpperCase()

const toDateInputValue = (value) => {
  if (!value) {
    return ''
  }

  const text = String(value)

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return match ? `${match[3]}-${match[2]}-${match[1]}` : ''
}

const createFallbackUsers = () => mockUsers.map(mapUserFromApi)

const filterUsersLocal = (users, filters) => {
  const keyword = filters.keyword.trim().toLowerCase()

  return users.filter((user) => {
    const matchesKeyword =
      !keyword ||
      user.fullName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone.toLowerCase().includes(keyword)
    const matchesRole = filters.role === 'all' || user.role === filters.role
    const matchesStatus = filters.status === 'all' || user.status === filters.status

    return matchesKeyword && matchesRole && matchesStatus
  })
}

const createCreatePayload = (formData) => ({
  hoTen: formData.hoTen.trim(),
  email: formData.email.trim(),
  matKhau: formData.matKhau,
  soDienThoai: formData.soDienThoai.trim(),
  ngaySinh: formData.ngaySinh || null,
  vaiTro: formData.vaiTro,
  trangThai: formData.trangThai === 'active',
  phanLoaiKhachHang: formData.phanLoaiKhachHang.trim(),
  chucVu: formData.chucVu.trim(),
})

const createUpdatePayload = (formData) => ({
  hoTen: formData.hoTen.trim(),
  soDienThoai: formData.soDienThoai.trim(),
  ngaySinh: formData.ngaySinh || null,
  vaiTro: formData.vaiTro,
  trangThai: formData.trangThai === 'active',
  phanLoaiKhachHang: formData.phanLoaiKhachHang.trim(),
  chucVu: formData.chucVu.trim(),
})

function AccountManagementPage() {
  const fallbackUsers = useMemo(createFallbackUsers, [])
  const [users, setUsers] = useState(fallbackUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [detailUser, setDetailUser] = useState(null)
  const [roleUser, setRoleUser] = useState(null)
  const [roleForm, setRoleForm] = useState({ vaiTro: 'khachhang', chucVu: '' })

  const filters = useMemo(
    () => ({
      keyword: searchTerm.trim(),
      role: roleFilter,
      status: statusFilter,
    }),
    [roleFilter, searchTerm, statusFilter],
  )

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUsers(filters)
      setUsers(data)
      setErrorMessage('')
    } catch (error) {
      setUsers(filterUsersLocal(fallbackUsers, filters))
      setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
    } finally {
      setIsLoading(false)
    }
  }, [fallbackUsers, filters])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const stats = useMemo(() => {
    return users.reduce(
      (result, user) => {
        result.total += 1
        result[user.role] = (result[user.role] || 0) + 1
        result[user.status] = (result[user.status] || 0) + 1
        return result
      },
      { total: 0, khachhang: 0, nhanvien: 0, quantrivien: 0, active: 0, locked: 0 },
    )
  }, [users])

  const openAddModal = () => {
    setActionError('')
    setActionMessage('')
    setModalMode('add')
    setEditingUserId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (user) => {
    setActionError('')
    setActionMessage('')
    setModalMode('edit')
    setEditingUserId(getUserKey(user))
    setFormData({
      hoTen: user.fullName,
      email: user.email,
      matKhau: '',
      soDienThoai: user.phone,
      ngaySinh: toDateInputValue(user.birthday),
      vaiTro: user.role,
      trangThai: user.status,
      phanLoaiKhachHang: user.customerRank || '',
      chucVu: user.position || '',
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setEditingUserId(null)
    setFormData(emptyForm)
    setActionError('')
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.hoTen.trim()) {
      return 'Họ tên không được rỗng.'
    }

    if (modalMode === 'add') {
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        return 'Email không hợp lệ.'
      }

      if (!formData.matKhau || formData.matKhau.length < 6) {
        return 'Mật khẩu tối thiểu 6 ký tự.'
      }
    }

    if (!formData.vaiTro) {
      return 'Vai trò bắt buộc.'
    }

    return ''
  }

  const saveUser = async (event) => {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setActionError(validationMessage)
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      if (modalMode === 'edit') {
        await updateUser(editingUserId, createUpdatePayload(formData))
        setActionMessage('Đã cập nhật tài khoản.')
      } else {
        await createUser(createCreatePayload(formData))
        setActionMessage('Đã thêm tài khoản.')
      }

      closeFormModal()
      await loadUsers()
    } catch (error) {
      setActionError(error.message || 'Thao tác tài khoản thất bại.')
    } finally {
      setIsSaving(false)
    }
  }

  const openDetailModal = async (user) => {
    setActionError('')
    setDetailUser(user)

    try {
      const data = await getUserById(getUserKey(user))
      setDetailUser(data)
    } catch (error) {
      setActionError(error.message || 'Không tải được chi tiết tài khoản.')
    }
  }

  const handleLockToggle = async (user) => {
    const userId = getUserKey(user)
    const isLocked = user.status === 'locked'

    if (!isLocked && !window.confirm('Bạn có chắc muốn khóa tài khoản này?')) {
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      if (isLocked) {
        await unlockUser(userId)
        setActionMessage('Đã mở khóa tài khoản.')
      } else {
        await lockUser(userId)
        setActionMessage('Đã khóa tài khoản.')
      }

      await loadUsers()
    } catch (error) {
      setActionError(error.message || 'Không cập nhật được trạng thái tài khoản.')
    } finally {
      setIsSaving(false)
    }
  }

  const openRoleModal = (user) => {
    setActionError('')
    setRoleUser(user)
    setRoleForm({ vaiTro: user.role, chucVu: user.position || '' })
  }

  const saveRole = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setActionError('')

    try {
      await changeUserRole(getUserKey(roleUser), {
        vaiTro: normalizeUserRole(roleForm.vaiTro),
        chucVu: roleForm.chucVu.trim(),
      })
      setRoleUser(null)
      setActionMessage('Đã đổi vai trò tài khoản.')
      await loadUsers()
    } catch (error) {
      setActionError(error.message || 'Không đổi được vai trò tài khoản.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm tài khoản này?')) {
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      await deleteUser(getUserKey(user))
      setActionMessage('Đã xóa mềm tài khoản.')
      await loadUsers()
    } catch (error) {
      setActionError(error.message || 'Không xóa được tài khoản.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="account-management-page">
      <section className="account-management-header">
        <div>
          <span>Khu vực quản trị</span>
          <h1>Quản lý tài khoản</h1>
          <p>Quản lý khách hàng, nhân viên, quản trị viên và trạng thái truy cập hệ thống.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm tài khoản
        </button>
      </section>

      {isLoading ? <div className="account-message">Đang tải tài khoản...</div> : null}
      {errorMessage ? <div className="account-message account-message-warning">{errorMessage}</div> : null}
      {actionMessage ? <div className="account-message account-message-success">{actionMessage}</div> : null}
      {actionError ? <div className="account-message account-message-error">{actionError}</div> : null}

      <section className="account-stat-grid">
        <article>
          <span>Tổng tài khoản</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Khách hàng</span>
          <strong>{stats.khachhang}</strong>
        </article>
        <article>
          <span>Nhân viên</span>
          <strong>{stats.nhanvien}</strong>
        </article>
        <article>
          <span>Quản trị viên</span>
          <strong>{stats.quantrivien}</strong>
        </article>
        <article>
          <span>Đang hoạt động</span>
          <strong>{stats.active}</strong>
        </article>
        <article>
          <span>Đã khóa</span>
          <strong>{stats.locked}</strong>
        </article>
      </section>

      <section className="account-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tên, email hoặc số điện thoại"
          />
        </label>
        <label>
          Vai trò
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="account-table-card">
        <div className="account-table-summary">
          <strong>{users.length} tài khoản</strong>
          <span>{errorMessage ? 'Đang hiển thị dữ liệu mẫu.' : 'Dữ liệu đồng bộ từ backend.'}</span>
        </div>

        <div className="account-table">
          <div className="account-table-head">
            <span>Avatar</span>
            <span>Họ tên</span>
            <span>Email</span>
            <span>Số điện thoại</span>
            <span>Vai trò</span>
            <span>Chức vụ/Hạng</span>
            <span>Ngày đăng ký</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {users.length ? (
            users.map((user) => (
              <article className="account-table-row" key={getUserKey(user)}>
                <div className="account-avatar">{createInitial(user.fullName)}</div>
                <strong>{user.fullName || '-'}</strong>
                <span>{user.email || '-'}</span>
                <span>{user.phone || '-'}</span>
                <span className={`account-role account-role-${user.role}`}>
                  {roleLabels[user.role] || user.role}
                </span>
                <span>{user.position || user.customerRank || '-'}</span>
                <span>{user.createdAt || '-'}</span>
                <span className={`account-status account-status-${user.status}`}>
                  {statusLabels[user.status] || user.status}
                </span>
                <div className="account-actions">
                  <button type="button" disabled={isSaving} onClick={() => openDetailModal(user)}>
                    Xem chi tiết
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => openEditModal(user)}>
                    Sửa
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => handleLockToggle(user)}>
                    {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => openRoleModal(user)}>
                    Đổi vai trò
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => handleDeleteUser(user)}>
                    Xóa
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="account-empty-state">Không có tài khoản phù hợp.</p>
          )}
        </div>
      </section>

      {modalMode ? (
        <div className="account-modal-backdrop" role="presentation">
          <form className="account-modal" onSubmit={saveUser}>
            <div className="account-modal-heading">
              <span>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{modalMode === 'add' ? 'Thêm tài khoản' : 'Sửa tài khoản'}</h2>
            </div>

            <div className="account-form-grid">
              <label>
                Họ tên
                <input name="hoTen" value={formData.hoTen} onChange={handleFormChange} />
              </label>
              {modalMode === 'add' ? (
                <>
                  <label>
                    Email
                    <input name="email" type="email" value={formData.email} onChange={handleFormChange} />
                  </label>
                  <label>
                    Mật khẩu
                    <input name="matKhau" type="password" value={formData.matKhau} onChange={handleFormChange} />
                  </label>
                </>
              ) : null}
              <label>
                Số điện thoại
                <input name="soDienThoai" value={formData.soDienThoai} onChange={handleFormChange} />
              </label>
              <label>
                Ngày sinh
                <input name="ngaySinh" type="date" value={formData.ngaySinh} onChange={handleFormChange} />
              </label>
              <label>
                Vai trò
                <select name="vaiTro" value={formData.vaiTro} onChange={handleFormChange}>
                  {roleOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trạng thái
                <select name="trangThai" value={formData.trangThai} onChange={handleFormChange}>
                  {statusOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Phân loại khách hàng
                <input name="phanLoaiKhachHang" value={formData.phanLoaiKhachHang} onChange={handleFormChange} />
              </label>
              <label>
                Chức vụ
                <input name="chucVu" value={formData.chucVu} onChange={handleFormChange} />
              </label>
            </div>

            <div className="account-modal-actions">
              <button type="button" disabled={isSaving} onClick={closeFormModal}>
                Hủy
              </button>
              <button className="button" type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detailUser ? (
        <div className="account-modal-backdrop" role="presentation">
          <section className="account-modal account-detail-modal">
            <div className="account-modal-heading">
              <span>Chi tiết tài khoản</span>
              <h2>{detailUser.fullName}</h2>
            </div>
            <div className="account-detail-grid">
              <div>
                <span>Mã tài khoản</span>
                <strong>{getUserKey(detailUser)}</strong>
              </div>
              <div>
                <span>Họ tên</span>
                <strong>{detailUser.fullName || '-'}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{detailUser.email || '-'}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailUser.phone || '-'}</strong>
              </div>
              <div>
                <span>Ngày sinh</span>
                <strong>{detailUser.birthday || '-'}</strong>
              </div>
              <div>
                <span>Vai trò</span>
                <strong>{roleLabels[normalizeUserRole(detailUser.role)] || detailUser.role}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{statusLabels[normalizeUserStatus(detailUser.status)] || detailUser.status}</strong>
              </div>
              <div>
                <span>Điểm tích lũy</span>
                <strong>{Number(detailUser.points || 0).toLocaleString('vi-VN')}</strong>
              </div>
              <div>
                <span>Phân loại khách hàng</span>
                <strong>{detailUser.customerRank || '-'}</strong>
              </div>
              <div>
                <span>Chức vụ</span>
                <strong>{detailUser.position || '-'}</strong>
              </div>
              <div>
                <span>Ngày đăng ký</span>
                <strong>{detailUser.createdAt || '-'}</strong>
              </div>
            </div>
            <div className="account-modal-actions">
              <button type="button" onClick={() => setDetailUser(null)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {roleUser ? (
        <div className="account-modal-backdrop" role="presentation">
          <form className="account-modal account-role-modal" onSubmit={saveRole}>
            <div className="account-modal-heading">
              <span>Đổi vai trò</span>
              <h2>{roleUser.fullName}</h2>
            </div>
            <label>
              Vai trò mới
              <select
                value={roleForm.vaiTro}
                onChange={(event) =>
                  setRoleForm((current) => ({ ...current, vaiTro: event.target.value }))
                }
              >
                {roleOptions.slice(1).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {roleForm.vaiTro !== 'khachhang' ? (
              <label>
                Chức vụ
                <input
                  value={roleForm.chucVu}
                  onChange={(event) =>
                    setRoleForm((current) => ({ ...current, chucVu: event.target.value }))
                  }
                />
              </label>
            ) : null}
            <div className="account-modal-actions">
              <button type="button" disabled={isSaving} onClick={() => setRoleUser(null)}>
                Hủy
              </button>
              <button className="button" type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu vai trò'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default AccountManagementPage
