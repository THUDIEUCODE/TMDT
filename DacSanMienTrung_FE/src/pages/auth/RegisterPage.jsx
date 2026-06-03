import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authService'
import { saveAuth } from '../../utils/authStorage'
import './LoginPage.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ tên.'
    }

    if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Email chưa đúng định dạng.'
    }

    if (formData.password.length < 6) {
      nextErrors.password = 'Mật khẩu tối thiểu 6 ký tự.'
    }

    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Xác nhận mật khẩu chưa khớp.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setMessage('')
      const response = await register({
        hoTen: formData.fullName.trim(),
        email: formData.email.trim(),
        matKhau: formData.password,
        soDienThoai: formData.phone.trim(),
      })

      const payload = response?.data ?? response
      if (payload?.token || payload?.user || payload?.nguoiDung) {
        saveAuth(response)
        navigate('/profile')
        return
      }

      navigate('/login', { state: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' } })
    } catch (error) {
      setMessage(error?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-visual">
        <span className="login-badge">Tạo tài khoản</span>
        <h1>Đặc Sản Miền Trung</h1>
        <p>Đăng ký để theo dõi đơn hàng, lưu thông tin giao hàng và nhận ưu đãi thành viên.</p>
        <div className="login-feature-grid">
          <span>Ưu đãi thành viên</span>
          <span>Lịch sử đơn hàng</span>
          <span>Combo quà tặng</span>
          <span>Đánh giá sản phẩm</span>
        </div>
      </div>

      <div className="login-card">
        <Link to="/" className="login-brand">
          <img src="/images/brand/logo-mark.png" alt="Đặc Sản Miền Trung" />
          <strong>Đặc Sản Miền Trung</strong>
        </Link>

        <div className="login-heading">
          <span>Bắt đầu mua sắm</span>
          <h2>Đăng ký</h2>
          <p>Nhập thông tin để tạo tài khoản khách hàng.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Họ tên
            <input
              value={formData.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName ? <small>{errors.fullName}</small> : null}
          </label>

          <label>
            Email
            <input
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="vana@gmail.com"
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label>
            Số điện thoại
            <input
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="0901234567"
            />
          </label>

          <label>
            Mật khẩu
            <input
              type="password"
              value={formData.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Tối thiểu 6 ký tự"
            />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>

          <label>
            Xác nhận mật khẩu
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
          </label>

          {message ? <p className="login-message">{message}</p> : null}

          <button className="button login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="login-register">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </section>
  )
}

export default RegisterPage
