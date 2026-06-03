import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { mockProducts } from '../../data/mockProducts'
import { addToCart } from '../../services/cartService'
import { getProductById, getProductsByCategory } from '../../services/productService'
import { getReviewsByProduct } from '../../services/reviewService'
import { getCurrentUserId, isLoggedIn } from '../../utils/authStorage'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const formatDate = (value) => {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const renderStars = (rating) => '★'.repeat(Math.max(0, Math.min(5, Number(rating || 0))))

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fallbackProduct = useMemo(
    () => mockProducts.find((item) => item.id === id || item.slug === id),
    [id],
  )
  const [product, setProduct] = useState(fallbackProduct)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    let isMounted = true

    const fallbackRelatedProducts = fallbackProduct
      ? mockProducts
          .filter((item) => item.id !== fallbackProduct.id && item.categorySlug === fallbackProduct.categorySlug)
          .slice(0, 4)
      : []

    const loadProduct = async () => {
      setIsLoading(true)
      setHasApiError(false)

      try {
        const apiProduct = await getProductById(id)
        const apiRelatedProducts = apiProduct.categoryId
          ? await getProductsByCategory(apiProduct.categoryId).catch(() => [])
          : []

        if (!isMounted) {
          return
        }

        setProduct(apiProduct || fallbackProduct)
        setSelectedVariantId('')
        setQuantity(1)
        setRelatedProducts(
          apiRelatedProducts.filter((item) => item.id !== apiProduct.id).slice(0, 4),
        )
      } catch {
        if (!isMounted) {
          return
        }

        setProduct(fallbackProduct)
        setSelectedVariantId('')
        setQuantity(1)
        setRelatedProducts(fallbackRelatedProducts)
        setHasApiError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [fallbackProduct, id])

  useEffect(() => {
    const productId = product?.maSanPham ?? product?.id

    if (!productId || !/^\d+$/.test(String(productId))) {
      setReviews([])
      setReviewsError('')
      setIsReviewsLoading(false)
      return undefined
    }

    let isMounted = true

    const loadReviews = async () => {
      setIsReviewsLoading(true)
      setReviewsError('')

      try {
        const apiReviews = await getReviewsByProduct(productId)

        if (!isMounted) {
          return
        }

        setReviews(apiReviews)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setReviews([])
        setReviewsError(error?.message || 'Không thể tải đánh giá sản phẩm.')
      } finally {
        if (isMounted) {
          setIsReviewsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [product?.id, product?.maSanPham])

  const galleryImages = useMemo(() => {
    const productImages = Array.isArray(product?.hinhAnhs)
      ? [...product.hinhAnhs]
          .sort((a, b) => Number(a.thuTu ?? 0) - Number(b.thuTu ?? 0))
          .map((image) => image.duongDanAnh || image.hinhAnh || image.image || image)
          .filter(Boolean)
      : []

    if (productImages.length > 0) {
      return productImages
    }

    return [product?.hinhAnh || product?.image].filter(Boolean)
  }, [product])

  useEffect(() => {
    setSelectedImage(galleryImages[0] || '')
  }, [galleryImages])

  const selectedVariant = product?.variants?.find((variant) => variant.id === selectedVariantId)
  const displayPrice = selectedVariant?.price || product?.price || 0
  const maxQuantity = selectedVariant?.stock || product?.stock || 1
  const reviewStats = useMemo(() => {
    const total = reviews.length
    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0

    return { total, average }
  }, [reviews])

  if (!product) {
    return (
      <section className="page-card">
        <h1 className="page-title">
          {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy sản phẩm'}
        </h1>
        {hasApiError ? <p>Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
        <Link className="button secondary" to="/categories">
          Quay lại danh mục
        </Link>
      </section>
    )
  }

  const increaseQuantity = () => {
    setCartError('')
    setQuantity((current) => Math.min(current + 1, maxQuantity))
  }

  const decreaseQuantity = () => {
    setCartError('')
    setQuantity((current) => Math.max(current - 1, 1))
  }

  const changeQuantity = (value) => {
    const nextQuantity = Number(value)

    if (!Number.isFinite(nextQuantity)) {
      return
    }

    setCartError('')
    setQuantity(Math.min(Math.max(nextQuantity, 1), maxQuantity))
  }

  const handleAddToCart = async () => {
    setCartMessage('')
    setCartError('')

    if (!isLoggedIn()) {
      setCartError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.')
      navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`)
      return
    }

    if (!selectedVariant) {
      setCartError('Vui lòng chọn biến thể sản phẩm.')
      return
    }

    if (quantity > maxQuantity) {
      setCartError('Số lượng vượt quá tồn kho.')
      return
    }

    try {
      setIsAddingToCart(true)
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`)
        return
      }

      await addToCart({
        maNguoiDung,
        maBienThe: selectedVariant.maBienThe,
        soLuong: quantity,
      })
      setCartMessage('Đã thêm sản phẩm vào giỏ hàng')
    } catch (error) {
      setCartError(error?.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isLoggedIn()) {
      setCartError('Vui lòng đăng nhập để mua hàng.')
      navigate(`/login?redirect=${encodeURIComponent(`/products/${id}`)}`)
      return
    }

    navigate('/checkout')
  }

  return (
    <div className="product-detail-page">
      {isLoading ? <p className="product-result-summary">Đang tải dữ liệu...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

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
            <img
              src={getImageUrl(selectedImage || product.hinhAnh || product.image)}
              alt={product.name}
              onError={handleImageError}
            />
          </div>
          <div className="product-detail-thumbs">
            {galleryImages.map((image, index) => (
              <button
                className={image === selectedImage ? 'active' : ''}
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
              >
                <img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} onError={handleImageError} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-info">
          <span className="product-detail-province">{product.province}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-rating">
            <span>★★★★★</span>
            <strong>{Number(product.rating || 5).toFixed(1)}</strong>
            <small>{product.stock} sản phẩm còn hàng</small>
          </div>
          <p className="product-detail-price">{displayPrice.toLocaleString('vi-VN')}đ</p>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-option-group">
            <h2>Chọn biến thể / trọng lượng</h2>
            <div className="variant-list">
              {(product.variants || []).map((variant) => (
                <button
                  className={variant.id === selectedVariantId ? 'active' : ''}
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id)
                    setQuantity(1)
                    setCartError('')
                    setCartMessage('')
                  }}
                >
                  <strong>{variant.label}</strong>
                  <span>{variant.price.toLocaleString('vi-VN')}đ</span>
                  <small>Còn {variant.stock} sản phẩm</small>
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
              <input
                min="1"
                max={maxQuantity}
                type="number"
                value={quantity}
                onChange={(event) => changeQuantity(event.target.value)}
              />
              <button type="button" onClick={increaseQuantity}>
                +
              </button>
            </div>
          </div>

          {cartError ? <p className="form-error">{cartError}</p> : null}
          {cartMessage ? (
            <p className="form-success">
              {cartMessage}. <Link to="/cart">Xem giỏ hàng</Link>
            </p>
          ) : null}

          <div className="product-detail-actions">
            <button className="button secondary" type="button" onClick={handleAddToCart} disabled={isAddingToCart}>
              {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
            <button className="button" type="button" onClick={handleBuyNow}>
              Mua ngay
            </button>
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

      <section className="product-review-section">
        <div className="section-heading">
          <span>Đánh giá từ khách hàng</span>
          <h2>Đánh giá từ khách hàng</h2>
          <p>{reviewStats.total} đánh giá · {reviewStats.average.toFixed(1)}/5 sao</p>
        </div>

        {isReviewsLoading ? <p className="product-result-summary">Đang tải đánh giá...</p> : null}
        {reviewsError ? <p className="form-error">{reviewsError}</p> : null}

        <div className="product-review-list">
          {reviews.map((review) => (
            <article className="product-review-card" key={review.id || `${review.customerName}-${review.reviewDate}`}>
              <div className="product-review-card-head">
                <div>
                  <strong>{review.customerName}</strong>
                  {review.variantName || review.variant ? <span>{review.variantName || review.variant}</span> : null}
                </div>
                <b>{renderStars(review.rating)} <small>{Number(review.rating || 0)}/5</small></b>
              </div>
              <p>{review.content || 'Không có nội dung đánh giá.'}</p>
              <time>{formatDate(review.reviewDate)}</time>
            </article>
          ))}

          {reviews.length === 0 && !isReviewsLoading ? (
            <section className="empty-products">
              <h2>Chưa có đánh giá nào cho sản phẩm này.</h2>
            </section>
          ) : null}
        </div>
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
