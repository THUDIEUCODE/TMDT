import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-pattern" />

      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand-mark">MT</span>
            <strong>Đặc Sản Miền Trung</strong>
          </div>
          <p>
            Gìn giữ hương vị quê nhà qua những món quà đặc sản từ Huế, Đà Nẵng,
            Quảng Nam, Quảng Ngãi và Khánh Hòa.
          </p>
        </div>

        <div>
          <h4>Khám phá</h4>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/combo-gift">Combo quà tặng</Link>
          <Link to="/blogs">Blog ẩm thực</Link>
        </div>

        <div>
          <h4>Hỗ trợ</h4>
          <Link to="/orders">Theo dõi đơn hàng</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/login">Tài khoản</Link>
        </div>

        <div>
          <h4>Liên hệ</h4>
          <p>128 Trần Phú, Đà Nẵng</p>
          <p>0935 122 618</p>
          <p>hello@dacsanmientrung.vn</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">© 2026 DacSanMienTrung.vn - Mang hương vị miền Trung đến mọi nhà.</div>
      </div>
    </footer>
  )
}

export default Footer
