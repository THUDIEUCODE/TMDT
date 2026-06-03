import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../../services/authService'
import { canAccessPath, getDefaultPathForRole, saveAuth } from '../../utils/authStorage'
import './LoginPage.css'

const demoAccounts = [
  {
    label: 'TK 1 - Quản trị',
    email: 'admin.an@dacsan.vn',
    matKhau: '$2b$10$hashedpw1',
  },
  {
    label: 'TK 3 - Nhân viên',
    email: 'nv.chau@dacsan.vn',
    matKhau: '$2b$10$hashedpw3',
  },
  {
    label: 'TK 5 - Khách hàng',
    email: 'lan.hoang@gmail.com',
    matKhau: '$2b$10$hashedpw5',
  },
]

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    remember: true,
  })
  const [message, setMessage] = useState(location.state?.message || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const finishLogin = (response) => {
    const user = saveAuth(response)
    const redirectPath = searchParams.get('redirect')
    const defaultPath = getDefaultPathForRole(user.role)
    const nextPath =
      redirectPath && redirectPath.startsWith('/') && canAccessPath(user.role, redirectPath)
        ? redirectPath
        : defaultPath

    setMessage('Đăng nhập thành công.')
    navigate(nextPath)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.account.trim() || !formData.password.trim()) {
      setMessage('Vui lòng nhập email và mật khẩu.')
      return
    }

    try {
      setIsSubmitting(true)
      setMessage('')
      const response = await login({
        email: formData.account.trim(),
        matKhau: formData.password,
      })
      finishLogin(response)
    } catch (error) {
      setMessage(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (account) => {
    try {
      setIsSubmitting(true)
      setMessage('')
      setFormData((current) => ({
        ...current,
        account: account.email,
        password: account.matKhau,
      }))

      const response = await login({
        email: account.email,
        matKhau: account.matKhau,
      })
      finishLogin(response)
    } catch (error) {
      setMessage(error?.message || 'Đăng nhập demo thất bại. Vui lòng kiểm tra dữ liệu SQL.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-visual">
        <span className="login-badge">Đặc sản 19 tỉnh miền Trung</span>
        <h1>Đặc Sản Miền Trung</h1>
        <p>
          Đăng nhập để theo dõi đơn hàng, lưu combo quà tặng và nhận ưu đãi cho
          những món đặc sản quen vị quê nhà.
        </p>
        <div className="login-feature-grid">
          <span>Mè xửng Huế</span>
          <span>Chả bò Đà Nẵng</span>
          <span>Bánh khô mè</span>
          <span>Mực rim me</span>
        </div>
      </div>

      <div className="login-card">
        <Link to="/" className="login-brand">
          <span>MT</span>
          <strong>Đặc Sản Miền Trung</strong>
        </Link>

        <div className="login-heading">
          <span>Xin chào trở lại</span>
          <h2>Đăng nhập</h2>
          <p>Nhập thông tin để tiếp tục mua sắm và quản lý tài khoản.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="account"
              value={formData.account}
              onChange={handleChange}
              placeholder="minhanh@example.com"
            />
          </label>

          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </label>

          <div className="login-options">
            <label className="remember-row">
              <input
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          {message ? <p className="login-message">{message}</p> : null}

          <button className="button login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-demo">
          <span>Đăng nhập nhanh để test</span>
          <div className="login-demo-actions">
            {demoAccounts.map((account) => (
              <button
                className="login-demo-button"
                key={account.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoLogin(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="login-register">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
