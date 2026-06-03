import { Link } from 'react-router-dom'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

function ProductCard({ product }) {
  const shortName = product.name.slice(0, 2).toUpperCase()
  const productImage = product.hinhAnh || product.image

  return (
    <article className="product-card">
      <Link className="product-media" to={`/products/${product.id}`}>
        <span className="product-badge">Bán chạy</span>
        <span className="product-origin">{product.origin}</span>
        <img
          className="product-image"
          src={getImageUrl(productImage)}
          alt={product.name || shortName}
          onError={handleImageError}
        />
      </Link>

      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="product-rating">
          <span>★★★★★</span>
          <small>{product.stock} còn hàng</small>
        </div>
        <p className="price">{product.price.toLocaleString('vi-VN')}đ</p>
        <Link className="button secondary product-button" to={`/products/${product.id}`}>
          Xem chi tiết
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
