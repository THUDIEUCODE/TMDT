import { NavLink } from 'react-router-dom'

const staffMenus = [
  { path: '/staff/dashboard', label: 'Tổng quan' },
  { path: '/staff/orders', label: 'Quản lý đơn hàng' },
  { path: '/staff/products', label: 'Quản lý sản phẩm' },
  { path: '/staff/categories', label: 'Quản lý danh mục' },
  { path: '/staff/inventory', label: 'Tồn kho' },
  { path: '/staff/returns', label: 'Hoàn hàng' },
  { path: '/staff/reviews', label: 'Đánh giá' },
  { path: '/staff/blogs', label: 'Blog' },
  { path: '/', label: 'Về trang chủ', end: true },
]

function StaffSidebar() {
  return (
    <aside className="staff-sidebar">
      <div className="staff-sidebar-profile">
        <div className="staff-avatar">NV</div>
        <div>
          <h3>Khu vực nhân viên</h3>
          <p>Đặc Sản Miền Trung</p>
        </div>
      </div>

      <nav className="staff-menu">
        {staffMenus.map((item) => (
          <NavLink
            end={item.end}
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'staff-menu-item active' : 'staff-menu-item'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default StaffSidebar
