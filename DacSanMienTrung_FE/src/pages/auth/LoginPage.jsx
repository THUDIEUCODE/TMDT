import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    remember: true,
  })
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.account.trim() || !formData.password.trim()) {
      setMessage('Vui lòng nhập email hoặc số điện thoại và mật khẩu.')
      return
    }

    setMessage('Đăng nhập thành công. Đang chuyển đến tài khoản cá nhân...')
    window.setTimeout(() => navigate('/profile'), 450)
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
            Email hoặc số điện thoại
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

          <button className="button login-submit" type="submit">
            Đăng nhập
          </button>
        </form>

        <p className="login-register">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
