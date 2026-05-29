import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Trang chủ', end: true },
  { path: '/categories', label: 'Danh mục' },
  { path: '/combo-gift', label: 'Combo quà tặng' },
  { path: '/blogs', label: 'Blog' },
  { path: '/cart', label: 'Giỏ hàng' },
  { path: '/login', label: 'Đăng nhập' },
]

function Header() {
  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <span>Hotline: 0935 122 618</span>
          <span>Miễn phí vận chuyển đơn từ 500.000đ</span>
          <span>Đặc sản 19 tỉnh miền Trung</span>
        </div>
      </div>

      <div className="container header-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">MT</span>
          <span>
            <strong>Đặc Sản Miền Trung</strong>
            <small>DacSanMienTrung.vn</small>
          </span>
        </NavLink>

        <nav className="main-nav">
          {navItems.map((item) => (
            <NavLink end={item.end} key={item.path} to={item.path}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
