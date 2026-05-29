import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { mockProducts } from '../../data/mockProducts'

function ProductDetailPage() {
  const { id } = useParams()
  const product = mockProducts.find((item) => item.id === id || item.slug === id)
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants?.[0]?.id || '')
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = product?.variants?.find((variant) => variant.id === selectedVariantId)
  const displayPrice = selectedVariant?.price || product?.price || 0

  const relatedProducts = product
    ? mockProducts
        .filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug)
        .slice(0, 4)
    : []

  if (!product) {
    return (
      <section className="page-card">
        <h1 className="page-title">Không tìm thấy sản phẩm</h1>
        <Link className="button secondary" to="/categories">
          Quay lại danh mục
        </Link>
      </section>
    )
  }

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(current + 1, selectedVariant?.stock || product.stock))
  }

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(current - 1, 1))
  }

  return (
    <div className="product-detail-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/categories">Danh mục</Link>
        <span>›</span>
        <Link to={`/categories/${product.categorySlug}`}>{product.subCategory}</Link>
        <span>›</span>
        <strong>{product.name}</strong>
      </nav>

      <section className="product-detail-main">
        <div className="product-detail-gallery">
          <div className="product-detail-image">
            <span>{product.image}</span>
          </div>
          <div className="product-detail-thumbs">
            <span>{product.image}</span>
            <span>{product.subCategory.slice(0, 2).toUpperCase()}</span>
            <span>{product.province.slice(0, 2).toUpperCase()}</span>
          </div>
        </div>

        <div className="product-detail-info">
          <span className="product-detail-province">{product.province}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-rating">
            <span>★★★★★</span>
            <strong>{product.rating.toFixed(1)}</strong>
            <small>{product.stock} sản phẩm còn hàng</small>
          </div>
          <p className="product-detail-price">{displayPrice.toLocaleString('vi-VN')}đ</p>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-option-group">
            <h2>Chọn biến thể / trọng lượng</h2>
            <div className="variant-list">
              {product.variants.map((variant) => (
                <button
                  className={variant.id === selectedVariantId ? 'active' : ''}
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id)
                    setQuantity(1)
                  }}
                >
                  <strong>{variant.label}</strong>
                  <span>{variant.price.toLocaleString('vi-VN')}đ</span>
                </button>
              ))}
            </div>
          </div>

          <div className="product-option-group">
            <h2>Số lượng</h2>
            <div className="quantity-control">
              <button type="button" onClick={decreaseQuantity}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={increaseQuantity}>
                +
              </button>
            </div>
          </div>

          <div className="product-detail-actions">
            <Link className="button secondary" to="/cart">
              Thêm vào giỏ
            </Link>
            <Link className="button" to="/checkout">
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="product-detail-tabs">
        <article>
          <h2>Mô tả</h2>
          <p>{product.description}</p>
        </article>
        <article>
          <h2>Thành phần</h2>
          <p>{product.ingredients}</p>
        </article>
        <article>
          <h2>Hướng dẫn bảo quản</h2>
          <p>{product.storageGuide}</p>
        </article>
        <article>
          <h2>Câu chuyện văn hóa</h2>
          <p>{product.culturalStory}</p>
        </article>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="section-heading centered">
            <span>Cùng danh mục</span>
            <h2>Sản phẩm liên quan</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage
