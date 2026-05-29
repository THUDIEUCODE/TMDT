import { Link } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'

function CategoryOverviewPage() {
  return (
    <div className="category-overview-page">
      <section className="category-hero">
        <span>Danh mục</span>
        <h1>Danh mục đặc sản miền Trung</h1>
        <p>Khám phá đặc sản theo vùng miền, tỉnh thành và loại sản phẩm.</p>
      </section>

      <section className="category-overview-grid">
        {mockCategories.map((category) => (
          <article className="category-overview-card" key={category.id}>
            <Link className="category-overview-image" to={`/categories/${category.slug}`}>
              <span>{category.image}</span>
            </Link>
            <div className="category-overview-body">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <div className="category-card-meta">
                <span>{category.productCount} sản phẩm</span>
                <span>{category.subCategories.length} nhóm nhỏ</span>
              </div>
              <Link className="button secondary" to={`/categories/${category.slug}`}>
                Xem sản phẩm
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default CategoryOverviewPage
