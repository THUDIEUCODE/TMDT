import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockCartItems, mockCartVoucher } from '../../data/mockCart'

const shippingMethods = {
  standard: { label: 'Giao hàng tiêu chuẩn', fee: 25000, description: 'Nhận hàng trong 3-5 ngày.' },
  express: { label: 'Giao hàng nhanh', fee: 45000, description: 'Nhận hàng trong 1-2 ngày.' },
}

function CheckoutInfoPage() {
  const navigate = useNavigate()
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Minh Anh',
    phone: '0901234567',
    email: 'minhanh@example.com',
    province: 'Đà Nẵng',
    district: 'Hải Châu',
    address: '128 Trần Phú',
    note: 'Giao giờ hành chính giúp tôi.',
  })

  const subtotal = useMemo(() => {
    return mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [])

  const shippingFee = shippingMethods[shippingMethod].fee
  const discount = mockCartVoucher.discountAmount
  const total = Math.max(subtotal - discount + shippingFee, 0)

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ tên người nhận.'
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.'
    }

    if (!formData.address.trim()) {
      nextErrors.address = 'Vui lòng nhập địa chỉ chi tiết.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitCheckout = (event) => {
    event.preventDefault()

    if (validateForm()) {
      navigate('/payment')
    }
  }

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span>›</span>
        <strong>Thông tin giao hàng</strong>
      </nav>

      <section className="checkout-hero">
        <span>Bước 1</span>
        <h1>Thông tin giao hàng</h1>
        <p>Nhập thông tin người nhận để cửa hàng chuẩn bị đơn đặc sản miền Trung cho bạn.</p>
      </section>

      <form className="checkout-layout" onSubmit={submitCheckout}>
        <div className="checkout-form-panel">
          <h2>Người nhận</h2>
          <div className="checkout-form-grid">
            <label>
              Họ tên người nhận
              <input
                value={formData.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="Nhập họ tên"
              />
              {errors.fullName && <small>{errors.fullName}</small>}
            </label>
            <label>
              Số điện thoại
              <input
                value={formData.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="0900000000"
              />
              {errors.phone && <small>{errors.phone}</small>}
            </label>
            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="email@example.com"
              />
            </label>
            <label>
              Tỉnh/thành
              <input
                value={formData.province}
                onChange={(event) => updateField('province', event.target.value)}
                placeholder="Đà Nẵng"
              />
            </label>
            <label>
              Quận/huyện
              <input
                value={formData.district}
                onChange={(event) => updateField('district', event.target.value)}
                placeholder="Hải Châu"
              />
            </label>
            <label className="checkout-full">
              Địa chỉ chi tiết
              <input
                value={formData.address}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="Số nhà, tên đường, phường/xã"
              />
              {errors.address && <small>{errors.address}</small>}
            </label>
            <label className="checkout-full">
              Ghi chú giao hàng
              <textarea
                rows="4"
                value={formData.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Ghi chú thêm cho người giao hàng"
              />
            </label>
          </div>

          <h2>Phương thức giao hàng</h2>
          <div className="shipping-methods">
            {Object.entries(shippingMethods).map(([key, method]) => (
              <label className={shippingMethod === key ? 'active' : ''} key={key}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === key}
                  onChange={() => setShippingMethod(key)}
                />
                <span>
                  <strong>{method.label}</strong>
                  <small>{method.description}</small>
                </span>
                <b>{method.fee.toLocaleString('vi-VN')}đ</b>
              </label>
            ))}
          </div>
        </div>

        <aside className="checkout-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="checkout-mini-items">
            {mockCartItems.map((item) => (
              <div key={item.id}>
                <span>{item.image}</span>
                <p>
                  <strong>{item.name}</strong>
                  <small>{item.variantLabel} x {item.quantity}</small>
                </p>
                <b>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</b>
              </div>
            ))}
          </div>
          <div className="summary-lines">
            <div>
              <span>Tổng tiền hàng</span>
              <strong>{subtotal.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div>
              <span>Giảm giá</span>
              <strong>-{discount.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div>
              <span>Phí vận chuyển</span>
              <strong>{shippingFee.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="summary-total">
              <span>Tổng thanh toán</span>
              <strong>{total.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>
          <button className="button checkout-submit" type="submit">
            Tiếp tục thanh toán
          </button>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutInfoPage
