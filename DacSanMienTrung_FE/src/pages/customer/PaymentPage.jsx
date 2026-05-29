import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockCartItems, mockCartVoucher } from '../../data/mockCart'

const paymentMethods = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng COD' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng' },
  { id: 'wallet', label: 'Ví điện tử' },
  { id: 'card', label: 'Thẻ tín dụng/ghi nợ' },
]

function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const subtotal = useMemo(() => {
    return mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [])
  const shippingFee = 25000
  const discount = mockCartVoucher.discountAmount
  const total = Math.max(subtotal - discount + shippingFee, 0)

  return (
    <div className="checkout-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span>›</span>
        <Link to="/checkout">Thông tin giao hàng</Link>
        <span>›</span>
        <strong>Thanh toán</strong>
      </nav>

      <section className="checkout-hero">
        <span>Bước 2</span>
        <h1>Thanh toán</h1>
        <p>Chọn phương thức thanh toán phù hợp để hoàn tất đơn hàng.</p>
      </section>

      <section className="checkout-layout">
        <div className="checkout-form-panel">
          <h2>Thông tin người nhận</h2>
          <div className="recipient-summary">
            <div>
              <span>Người nhận</span>
              <strong>Nguyễn Minh Anh</strong>
            </div>
            <div>
              <span>Số điện thoại</span>
              <strong>0901234567</strong>
            </div>
            <div>
              <span>Địa chỉ</span>
              <strong>128 Trần Phú, Hải Châu, Đà Nẵng</strong>
            </div>
          </div>

          <h2>Phương thức thanh toán</h2>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <label className={paymentMethod === method.id ? 'active' : ''} key={method.id}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>

          {paymentMethod === 'bank' && (
            <div className="payment-note">
              <h3>Thông tin chuyển khoản mẫu</h3>
              <p>Ngân hàng: Vietcombank</p>
              <p>Số tài khoản: 0123456789</p>
              <p>Chủ tài khoản: DAC SAN MIEN TRUNG</p>
              <p>Nội dung: DH20260529001 - Số điện thoại của bạn</p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="payment-note">
              <h3>Thanh toán khi nhận hàng</h3>
              <p>Bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng sau khi kiểm tra đơn.</p>
            </div>
          )}
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
          <div className="payment-actions">
            <Link className="button secondary" to="/checkout">
              Quay lại
            </Link>
            <Link className="button" to="/order-success">
              Xác nhận đặt hàng
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PaymentPage
