import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'
import { getRootCategories } from '../../services/categoryService'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const isRootCategory = (category) => category.parentId === null || category.parentId === undefined
const getCategoryPath = (category) => `/categories/${category.id ?? category.slug}`

const getCategoryProductCount = (category, childCategories) => {
  const categoryIds = new Set([category.id, category.slug, ...childCategories.map((child) => child.id), ...childCategories.map((child) => child.slug)].filter(Boolean))

  if (category.productCount !== undefined && category.productCount !== null && category.productCount > 0) {
    return Number(category.productCount)
  }

  return mockProducts.filter(
    (product) => categoryIds.has(product.categoryId) || categoryIds.has(product.categorySlug),
  ).length
}

const enrichMockCategories = (categories) => {
  const normalizedCategories = categories.map((category) => ({
    ...category,
    parentId: category.parentId ?? null,
  }))

  return normalizedCategories.filter(isRootCategory).map((category) => {
    const childCategories = normalizedCategories.filter(
      (child) => child.parentId !== null && String(child.parentId) === String(category.id),
    )
    const childCount =
      category.childCount ??
      (childCategories.length > 0 ? childCategories.length : (category.subCategories || []).length)

    return {
      ...category,
      productCount: getCategoryProductCount(category, childCategories),
      childCount,
    }
  })
}

const rootMockCategories = enrichMockCategories(mockCategories)

function CategoryOverviewPage() {
  const [categories, setCategories] = useState(rootMockCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const apiCategories = await getRootCategories()

        if (!isMounted) {
          return
        }

        setCategories(apiCategories.length > 0 ? apiCategories : rootMockCategories)
        setHasApiError(false)
      } catch {
        if (!isMounted) {
          return
        }

        setCategories(rootMockCategories)
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
            <Link className="category-overview-image" to={getCategoryPath(category)}>
              <img
                src={getImageUrl(category.hinhAnh || category.image)}
                alt={category.name}
                onError={handleImageError}
              />
            </Link>
            <div className="category-overview-body">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <div className="category-card-meta">
                <span>{category.productCount ?? 0} sản phẩm</span>
                <span>{category.childCount ?? 0} nhóm nhỏ</span>
              </div>
              <Link className="button secondary" to={getCategoryPath(category)}>
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
