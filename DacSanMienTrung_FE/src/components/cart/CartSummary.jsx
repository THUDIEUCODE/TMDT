function CartSummary({ items = [] }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <aside className="page-card">
      <h2 className="section-title">Tóm tắt giỏ hàng</h2>
      <p className="muted">{items.length} sản phẩm</p>
      <p className="price">{total.toLocaleString('vi-VN')}đ</p>
    </aside>
  )
}

export default CartSummary
