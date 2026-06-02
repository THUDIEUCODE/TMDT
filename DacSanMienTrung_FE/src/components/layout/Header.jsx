import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getCurrentUser, isLoggedIn, logout } from '../../utils/authStorage'

const navItems = [
  { path: '/', label: 'Trang chủ', end: true },
  { path: '/categories', label: 'Danh mục' },
  { path: '/combo-gift', label: 'Combo quà tặng' },
  { path: '/blogs', label: 'Blog' },
]

function Header() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(getCurrentUser())
    }

    window.addEventListener('auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    navigate('/login')
  }

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
          <NavLink to={currentUser ? '/cart' : '/login?redirect=/cart'}>Giỏ hàng</NavLink>
          {isLoggedIn() && currentUser ? (
            <>
              <NavLink to="/profile">{currentUser.name || currentUser.email || 'Tài khoản'}</NavLink>
              <button className="nav-logout-button" type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <NavLink to="/login">Đăng nhập</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
