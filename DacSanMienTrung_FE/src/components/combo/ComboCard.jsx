function ComboCard({ combo }) {
  return (
    <article className="combo-card">
      <h3>{combo.name}</h3>
      <p className="muted">{combo.description}</p>
      <p className="price">{combo.price.toLocaleString('vi-VN')}đ</p>
    </article>
  )
}

export default ComboCard
