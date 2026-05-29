import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import BlogCard from '../../components/blog/BlogCard'
import { mockBlogs } from '../../data/mockBlogs'
import { mockCategories } from '../../data/mockCategories'
import { mockCombos } from '../../data/mockCombos'
import { mockProducts } from '../../data/mockProducts'

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

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const bestSellingProducts = mockProducts.slice(0, 8)
  const featuredCategories = mockCategories.slice(0, 6)
  const slide = heroSlides[activeSlide]

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
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
            <Link className="category-card" key={category.id} to={`/categories/${category.slug}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading centered">
          <span>Bán chạy</span>
          <h2>Sản phẩm yêu thích</h2>
          <p>Các món đặc sản quen thuộc, dễ làm quà và dễ thưởng thức.</p>
        </div>
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
