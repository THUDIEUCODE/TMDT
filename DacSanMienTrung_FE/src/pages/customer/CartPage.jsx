import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockCartItems, mockCartVoucher } from '../../data/mockCart'
import './CartPage.css'

const shippingFee = 25000
const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

function CartPage() {
  const [items, setItems] = useState(mockCartItems)
  const [voucherCode, setVoucherCode] = useState(mockCartVoucher.code)
  const [appliedVoucher, setAppliedVoucher] = useState(mockCartVoucher)

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0
  const total = Math.max(subtotal - discount + shippingFee, 0)

  const updateQuantity = (itemId, nextQuantity) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.min(Math.max(nextQuantity, 1), item.stock) }
          : item,
      ),
    )
  }

  const removeItem = (itemId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }

  const applyVoucher = () => {
    const normalizedCode = voucherCode.trim().toUpperCase()
    setAppliedVoucher(normalizedCode === mockCartVoucher.code ? mockCartVoucher : null)
  }

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <span>Giỏ hàng</span>
        <h1>Giỏ hàng của bạn</h1>
        <p>Kiểm tra sản phẩm, số lượng và áp dụng ưu đãi trước khi đặt hàng.</p>
      </section>

      {items.length > 0 ? (
        <section className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <span>{item.image}</span>
                </div>

                <div className="cart-item-info">
                  <h2>{item.name}</h2>
                  <p>{item.province}</p>
                  <span>{item.variantLabel}</span>
                </div>

                <div className="cart-item-price">
                  <small>Đơn giá</small>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>

                <div className="quantity-control cart-quantity">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <small>Thành tiền</small>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>

                <button className="cart-remove" type="button" onClick={() => removeItem(item.id)}>
                  Xóa
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary-panel">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="voucher-box">
              <label htmlFor="voucher">Mã voucher</label>
              <div>
                <input
                  id="voucher"
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value)}
                  placeholder="Nhập mã ưu đãi"
                />
                <button type="button" onClick={applyVoucher}>
                  Áp dụng
                </button>
              </div>
              {appliedVoucher ? (
                <p>Đã áp dụng mã {appliedVoucher.code}</p>
              ) : (
                <p className="voucher-warning">Mã chưa hợp lệ hoặc chưa được áp dụng.</p>
              )}
            </div>

            <div className="summary-lines">
              <div>
                <span>Tổng tiền hàng</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                <span>Giảm giá</span>
                <strong>-{formatCurrency(discount)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển tạm tính</span>
                <strong>{formatCurrency(shippingFee)}</strong>
              </div>
              <div className="summary-total">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>

            <Link className="button cart-checkout-button" to="/checkout">
              Tiến hành đặt hàng
            </Link>
          </aside>
        </section>
      ) : (
        <section className="empty-products">
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn vài món đặc sản miền Trung trước khi đặt hàng.</p>
          <Link className="button" to="/categories">
            Xem danh mục
          </Link>
        </section>
      )}
    </div>
  )
}

export default CartPage
