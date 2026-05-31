import { NavLink } from 'react-router-dom'

const adminMenus = [
  { path: '/admin/dashboard', label: 'Tổng quan' },
  { path: '/admin/accounts', label: 'Quản lý tài khoản' },
  { path: '/admin/vouchers', label: 'Quản lý voucher' },
  { path: '/admin/reports', label: 'Báo cáo thống kê' },
  { path: '/', label: 'Về trang chủ', end: true },
]

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-profile">
        <div className="admin-avatar">AD</div>
        <div>
          <h3>Khu vực quản trị</h3>
          <p>Đặc Sản Miền Trung</p>
        </div>
      </div>

      <nav className="admin-menu">
        {adminMenus.map((item) => (
          <NavLink
            end={item.end}
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'admin-menu-item active' : 'admin-menu-item'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
