import { useMemo, useState } from 'react'
import { mockUsers } from '../../data/mockUsers'
import './AccountManagementPage.css'

const roleLabels = {
  customer: 'Khách hàng',
  staff: 'Nhân viên',
  admin: 'Quản trị viên',
}

const statusLabels = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'customer',
  status: 'active',
  tempPassword: '',
}

function AccountManagementPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [detailUser, setDetailUser] = useState(null)
  const [roleUser, setRoleUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('customer')

  const stats = useMemo(() => {
    return users.reduce(
      (result, user) => {
        result.total += 1
        result[user.role] += 1
        result[user.status] += 1
        return result
      },
      { total: 0, customer: 0, staff: 0, admin: 0, active: 0, locked: 0 },
    )
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.phone.toLowerCase().includes(normalizedSearch)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, searchTerm, statusFilter, users])

  const openAddModal = () => {
    setModalMode('add')
    setEditingUserId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (user) => {
    setModalMode('edit')
    setEditingUserId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      tempPassword: '',
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setEditingUserId(null)
    setFormData(emptyForm)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const saveUser = (event) => {
    event.preventDefault()

    const nextUserData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      status: formData.status,
    }

    if (modalMode === 'edit') {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUserId ? { ...user, ...nextUserData } : user,
        ),
      )
    } else {
      setUsers((currentUsers) => [
        {
          ...nextUserData,
          id: `U${Date.now()}`,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          lastLogin: 'Chưa đăng nhập',
          orderCount: 0,
          note: formData.tempPassword
            ? `Mật khẩu tạm thời đã cấp: ${formData.tempPassword}`
            : 'Tài khoản mới tạo.',
        },
        ...currentUsers,
      ])
    }

    closeFormModal()
  }

  const toggleLockUser = (user) => {
    if (user.status === 'active') {
      const confirmed = window.confirm(`Khóa tài khoản ${user.name}?`)
      if (!confirmed) {
        return
      }
    }

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id
          ? { ...item, status: item.status === 'locked' ? 'active' : 'locked' }
          : item,
      ),
    )
  }

  const openRoleModal = (user) => {
    setRoleUser(user)
    setSelectedRole(user.role)
  }

  const saveRole = (event) => {
    event.preventDefault()
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === roleUser.id ? { ...user, role: selectedRole } : user,
      ),
    )
    setRoleUser(null)
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

      <section className="account-stat-grid">
        <article>
          <span>Tổng tài khoản</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Khách hàng</span>
          <strong>{stats.customer}</strong>
        </article>
        <article>
          <span>Nhân viên</span>
          <strong>{stats.staff}</strong>
        </article>
        <article>
          <span>Quản trị viên</span>
          <strong>{stats.admin}</strong>
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
            <option value="all">Tất cả</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="account-table-card">
        <div className="account-table-summary">
          <strong>{filteredUsers.length} tài khoản</strong>
          <span>Dữ liệu mock, thao tác cập nhật bằng state nội bộ.</span>
        </div>

        <div className="account-table">
          <div className="account-table-head">
            <span>Avatar</span>
            <span>Họ tên</span>
            <span>Email</span>
            <span>Số điện thoại</span>
            <span>Vai trò</span>
            <span>Ngày tạo</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredUsers.map((user) => (
            <article className="account-table-row" key={user.id}>
              <div className="account-avatar">{user.name.charAt(0)}</div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span>{user.phone}</span>
              <span className={`account-role account-role-${user.role}`}>
                {roleLabels[user.role]}
              </span>
              <span>{user.createdAt}</span>
              <span className={`account-status account-status-${user.status}`}>
                {statusLabels[user.status]}
              </span>
              <div className="account-actions">
                <button type="button" onClick={() => setDetailUser(user)}>
                  Xem chi tiết
                </button>
                <button type="button" onClick={() => openEditModal(user)}>
                  Sửa
                </button>
                <button type="button" onClick={() => toggleLockUser(user)}>
                  {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                </button>
                <button type="button" onClick={() => openRoleModal(user)}>
                  Đổi vai trò
                </button>
              </div>
            </article>
          ))}
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
                <input required name="name" value={formData.name} onChange={handleFormChange} />
              </label>
              <label>
                Email
                <input required name="email" type="email" value={formData.email} onChange={handleFormChange} />
              </label>
              <label>
                Số điện thoại
                <input required name="phone" value={formData.phone} onChange={handleFormChange} />
              </label>
              <label>
                Vai trò
                <select name="role" value={formData.role} onChange={handleFormChange}>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Trạng thái
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {modalMode === 'add' ? (
                <label>
                  Mật khẩu tạm thời
                  <input
                    name="tempPassword"
                    value={formData.tempPassword}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: DacSan@123"
                  />
                </label>
              ) : null}
            </div>

            <div className="account-modal-actions">
              <button type="button" onClick={closeFormModal}>
                Hủy
              </button>
              <button className="button" type="submit">
                Lưu
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
              <h2>{detailUser.name}</h2>
            </div>
            <div className="account-detail-grid">
              <div>
                <span>Họ tên</span>
                <strong>{detailUser.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{detailUser.email}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailUser.phone}</strong>
              </div>
              <div>
                <span>Vai trò</span>
                <strong>{roleLabels[detailUser.role]}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{statusLabels[detailUser.status]}</strong>
              </div>
              <div>
                <span>Ngày tạo</span>
                <strong>{detailUser.createdAt}</strong>
              </div>
              <div>
                <span>Lần đăng nhập gần nhất</span>
                <strong>{detailUser.lastLogin}</strong>
              </div>
              <div>
                <span>Số đơn hàng</span>
                <strong>{detailUser.role === 'customer' ? detailUser.orderCount : 'Không áp dụng'}</strong>
              </div>
              <div className="account-detail-full">
                <span>Ghi chú tài khoản</span>
                <strong>{detailUser.note || 'Không có ghi chú'}</strong>
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
              <h2>{roleUser.name}</h2>
            </div>
            <label>
              Vai trò mới
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="account-modal-actions">
              <button type="button" onClick={() => setRoleUser(null)}>
                Hủy
              </button>
              <button className="button" type="submit">
                Lưu vai trò
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default AccountManagementPage
