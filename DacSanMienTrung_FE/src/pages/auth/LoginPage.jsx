import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <section className="page-card">
      <h1 className="page-title">Đăng nhập</h1>
      <form className="form">
        <label>
          Email
          <input type="email" placeholder="email@example.com" />
        </label>
        <label>
          Mật khẩu
          <input type="password" placeholder="Nhập mật khẩu" />
        </label>
        <button className="button" type="button">
          Đăng nhập
        </button>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
        <Link to="/register">Tạo tài khoản mới</Link>
      </form>
    </section>
  )
}

export default LoginPage
