import { Link } from 'react-router-dom'
import { getCurrentUserRole, getDefaultPathForRole } from '../../utils/authStorage'
import './LoginPage.css'

function UnauthorizedPage() {
  const role = getCurrentUserRole()
  const defaultPath = getDefaultPathForRole(role)

  return (
    <section className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand">
          <img src="/images/brand/logo-mark.png" alt="Đặc Sản Miền Trung" />
          <strong>Đặc Sản Miền Trung</strong>
        </Link>

        <div className="login-heading">
          <span>Không có quyền</span>
          <h2>Bạn không có quyền truy cập</h2>
          <p>Tài khoản hiện tại không được phép truy cập trang này.</p>
        </div>

        <div className="login-form">
          <Link className="button login-submit" to="/">
            Về trang chủ
          </Link>
          <Link className="button login-submit" to={defaultPath}>
            Về trang phù hợp
          </Link>
        </div>
      </div>
    </section>
  )
}

export default UnauthorizedPage
