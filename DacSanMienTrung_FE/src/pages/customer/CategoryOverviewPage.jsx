import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'
import { getCategories } from '../../services/categoryService'

function CategoryOverviewPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const apiCategories = await getCategories()

        if (!isMounted) {
          return
        }

        setCategories(apiCategories.length > 0 ? apiCategories : mockCategories)
        setHasApiError(false)
      } catch {
        if (!isMounted) {
          return
        }

        setCategories(mockCategories)
        setHasApiError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="category-overview-page">
      <section className="category-hero">
        <span>Danh mục</span>
        <h1>Danh mục đặc sản miền Trung</h1>
        <p>Khám phá đặc sản theo vùng miền, tỉnh thành và loại sản phẩm.</p>
      </section>

      {isLoading ? <p className="product-result-summary">Đang tải dữ liệu...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

      <section className="category-overview-grid">
        {categories.map((category) => (
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
