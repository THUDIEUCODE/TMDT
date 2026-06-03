import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import BlogCard from '../../components/blog/BlogCard'
import { mockBlogs } from '../../data/mockBlogs'
import { mockCategories } from '../../data/mockCategories'
import { mockCombos } from '../../data/mockCombos'
import { mockProducts } from '../../data/mockProducts'
import { getRootCategories } from '../../services/categoryService'
import { getProducts } from '../../services/productService'
import { getActiveVouchers } from '../../services/voucherService'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const heroSlides = [
  {
    badge: 'Xứ Huế Cố Đô',
    title: 'Hương Vị Hoàng Cung',
    description: 'Mè xửng, mắm ruốc, trà cung đình và những món quà mang phong vị đất thần kinh.',
    cta: 'Khám phá Huế',
    gradient: 'hero-purple',
    visual: 'Huế',
  },
  {
    badge: 'Quà Tặng Miền Trung',
    title: 'Đặc Sản Miền Trung',
    description: 'Gói trọn hương vị nắng gió trong từng hộp quà chỉn chu cho gia đình và đối tác.',
    cta: 'Xem combo quà',
    gradient: 'hero-red',
    visual: 'Quà',
  },
  {
    badge: 'Sản Phẩm Bán Chạy',
    title: 'Món Ngon Về Từ Xứ Quảng',
    description: 'Mực rim me, bánh khô mè, mì Quảng khô và nhiều đặc sản quen thuộc khác.',
    cta: 'Mua ngay',
    gradient: 'hero-green',
    visual: 'Quảng',
  },
]

const isRootCategory = (category) => category.parentId === null || category.parentId === undefined
const rootMockCategories = mockCategories.filter(isRootCategory)
const getCategoryPath = (category) => `/categories/${category.id ?? category.slug}`
const pendingVoucherStorageKey = 'dacsan_pending_voucher_code'
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatVoucherDiscount = (voucher) =>
  voucher.discountType === 'phanTram'
    ? `${Number(voucher.discountValue || 0).toLocaleString('vi-VN')}%`
    : formatCurrency(voucher.discountValue)
const formatDate = (value) => {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [products, setProducts] = useState(mockProducts)
  const [categories, setCategories] = useState(rootMockCategories)
  const [vouchers, setVouchers] = useState([])
  const [voucherMessage, setVoucherMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const bestSellingProducts = products.slice(0, 8)
  const featuredCategories = categories.slice(0, 6)
  const slide = heroSlides[activeSlide]

  useEffect(() => {
    let isMounted = true

    const loadHomeData = async () => {
      try {
        const [apiProducts, apiCategories, apiVouchers] = await Promise.all([
          getProducts(),
          getRootCategories(),
          getActiveVouchers().catch(() => []),
        ])

        if (!isMounted) {
          return
        }

        setProducts(apiProducts.length > 0 ? apiProducts : mockProducts)
        setCategories(apiCategories.length > 0 ? apiCategories : rootMockCategories)
        setVouchers(apiVouchers.slice(0, 4))
        setHasApiError(false)
      } catch {
        if (!isMounted) {
          return
        }

        setProducts(mockProducts)
        setCategories(rootMockCategories)
        setVouchers([])
        setHasApiError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [])

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
  }

  const copyVoucherCode = async (code) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      }
      setVoucherMessage('Đã sao chép mã voucher.')
    } catch {
      setVoucherMessage(`Mã voucher: ${code}`)
    }
  }

  const handleUseVoucherNow = (code) => {
    localStorage.setItem(pendingVoucherStorageKey, code)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => undefined)
    }
  }

  return (
    <div className="home-page">
      <section className={`home-hero ${slide.gradient}`}>
        <button className="hero-arrow hero-arrow-left" type="button" onClick={showPreviousSlide}>
          ‹
        </button>
        <button className="hero-arrow hero-arrow-right" type="button" onClick={showNextSlide}>
          ›
        </button>

        <div className="hero-content">
          <span className="hero-badge">{slide.badge}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          <div className="hero-actions">
            <Link className="button hero-button" to={activeSlide === 1 ? '/combo-gift' : '/products'}>
              {slide.cta}
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-plate">
            <span>{slide.visual}</span>
          </div>
        </div>

        <div className="hero-dots">
          {heroSlides.map((item, index) => (
            <button
              className={index === activeSlide ? 'active' : ''}
              key={item.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Chuyển đến banner ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="home-section compact-section">
        <div className="section-heading centered">
          <span>Danh mục</span>
          <h2>Danh mục nổi bật</h2>
          <p>Những nhóm đặc sản được khách hàng chọn nhiều nhất.</p>
        </div>
        <div className="category-grid">
          {featuredCategories.map((category, index) => (
            <Link className="category-card" key={category.id} to={getCategoryPath(category)}>
              <div className="category-card-media">
                <img
                  src={getImageUrl(category.hinhAnh || category.image)}
                  alt={category.name}
                  onError={handleImageError}
                />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      {vouchers.length > 0 ? (
        <section className="home-section voucher-offer-section">
          <div className="section-heading centered">
            <span>Ưu đãi</span>
            <h2>Voucher đang áp dụng</h2>
            <p>Sao chép mã ưu đãi và dùng khi đặt hàng để nhận giảm giá trực tiếp.</p>
          </div>
          {voucherMessage ? <p className="product-result-summary">{voucherMessage}</p> : null}
          <div className="home-voucher-grid">
            {vouchers.map((voucher, index) => (
              <article className={`home-voucher-card voucher-tone-${(index % 4) + 1}`} key={voucher.id}>
                <div className="home-voucher-main">
                  <span>{voucher.discountTypeLabel}</span>
                  <strong>{formatVoucherDiscount(voucher)}</strong>
                  <p>Cho đơn từ {formatCurrency(voucher.minOrderValue)}</p>
                </div>
                <h3>{voucher.code}</h3>
                <p>Đơn tối thiểu {formatCurrency(voucher.minOrderValue)}</p>
                <small>
                  Còn {Number(voucher.quantity || 0).toLocaleString('vi-VN')} lượt - hết hạn {formatDate(voucher.endDate)}
                </small>
                <div className="home-voucher-actions">
                  <button type="button" onClick={() => copyVoucherCode(voucher.code)}>
                    Sao chép mã
                  </button>
                  <Link className="button" to="/cart" onClick={() => handleUseVoucherNow(voucher.code)}>
                    Dùng ngay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="home-section">
        <div className="section-heading centered">
          <span>Bán chạy</span>
          <h2>Sản phẩm yêu thích</h2>
          <p>Các món đặc sản quen thuộc, dễ làm quà và dễ thưởng thức.</p>
        </div>
        {isLoading ? <p className="product-result-summary">Đang tải dữ liệu...</p> : null}
        {hasApiError ? (
          <p className="product-result-summary">
            Không kết nối được backend, đang dùng dữ liệu mẫu.
          </p>
        ) : null}
        <div className="product-grid">
          {bestSellingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-section cream-section">
        <div className="section-heading centered">
          <span>Quà tặng</span>
          <h2>Combo quà tặng</h2>
          <p>Gói trọn hương vị miền Trung trong những hộp quà chỉn chu.</p>
        </div>
        <div className="combo-grid">
          {mockCombos.map((combo) => (
            <Link className="home-combo-card" key={combo.id} to="/combo-gift">
              <span className="combo-label">Combo</span>
              <h3>{combo.name}</h3>
              <p>{combo.description}</p>
              <strong>{combo.price.toLocaleString('vi-VN')}đ</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading centered">
          <span>Blog</span>
          <h2>Câu chuyện ẩm thực</h2>
          <p>Câu chuyện món ngon, vùng đất và cách chọn quà đặc sản.</p>
        </div>
        <div className="blog-grid">
          {mockBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
