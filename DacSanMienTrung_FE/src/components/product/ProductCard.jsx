import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  const shortName = product.name.slice(0, 2).toUpperCase()

  return (
    <article className="product-card">
      <Link className="product-media" to={`/products/${product.id}`}>
        <span className="product-badge">Bán chạy</span>
        <span className="product-origin">{product.origin}</span>
        <span className="product-symbol">{shortName}</span>
      </Link>

      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="product-rating">
          <span>★★★★★</span>
          <small>{product.stock} còn hàng</small>
        </div>
        <p className="price">{product.price.toLocaleString('vi-VN')}đ</p>
        <Link className="button secondary product-button" to="/cart">
          Thêm vào giỏ
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
