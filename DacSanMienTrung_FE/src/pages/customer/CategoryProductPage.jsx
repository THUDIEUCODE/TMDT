import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'
import { getCategoryById, getChildCategories } from '../../services/categoryService'
import { getProductsByCategoryTree } from '../../services/productService'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

const isNumericId = (value) => /^\d+$/.test(String(value || ''))
const normalizeId = (value) => String(value ?? '')
const mockCategoryAliases = [
  {
    id: '1',
    name: 'Bánh Kẹo',
    slug: '1',
    description: 'Nhóm đặc sản bánh kẹo miền Trung.',
    image: 'BK',
    productCount: 0,
    parentId: null,
    subCategories: ['Bánh', 'Kẹo'],
  },
  {
    id: '9',
    name: 'Bánh',
    slug: '9',
    description: 'Các loại bánh đặc sản.',
    image: 'BA',
    productCount: 0,
    parentId: '1',
    subCategories: [],
  },
  {
    id: '10',
    name: 'Kẹo',
    slug: '10',
    description: 'Các loại kẹo đặc sản.',
    image: 'KE',
    productCount: 0,
    parentId: '1',
    subCategories: [],
  },
]
const fallbackCategories = [...mockCategories, ...mockCategoryAliases]

function findMockCategory(categorySlug) {
  return fallbackCategories.find(
    (item) => normalizeId(item.id) === normalizeId(categorySlug) || item.slug === categorySlug,
  )
}

function findMockParentCategory(category) {
  if (!category?.parentId) {
    return null
  }

  return findMockCategory(category.parentId)
}

function getFallbackProducts(categorySlug, category) {
  const categoryKeys = new Set(
    [categorySlug, category?.id, category?.slug].filter((value) => value !== null && value !== undefined).map(normalizeId),
  )

  return mockProducts.filter(
    (product) => categoryKeys.has(normalizeId(product.categoryId)) || categoryKeys.has(product.categorySlug),
  )
}

function isInPriceRange(product, range) {
  if (range === 'under-100') {
    return product.price < 100000
  }

  if (range === '100-300') {
    return product.price >= 100000 && product.price <= 300000
  }

  if (range === 'over-300') {
    return product.price > 300000
  }

  return true
}

function sortProducts(products, sortBy) {
  const sortedProducts = [...products]

  if (sortBy === 'price-asc') {
    return sortedProducts.sort((a, b) => a.price - b.price)
  }

  if (sortBy === 'price-desc') {
    return sortedProducts.sort((a, b) => b.price - a.price)
  }

  if (sortBy === 'name-asc') {
    return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  }

  return sortedProducts
}

function CategoryProductPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const isCategoryId = isNumericId(categorySlug)
  const fallbackCategory = useMemo(() => findMockCategory(categorySlug), [categorySlug])
  const fallbackParentCategory = useMemo(() => findMockParentCategory(fallbackCategory), [fallbackCategory])
  const fallbackProducts = useMemo(
    () => getFallbackProducts(categorySlug, fallbackCategory),
    [categorySlug, fallbackCategory],
  )
  const [category, setCategory] = useState(fallbackCategory)
  const [parentCategory, setParentCategory] = useState(fallbackParentCategory)
  const [childCategories, setChildCategories] = useState([])
  const [categoryProducts, setCategoryProducts] = useState(fallbackProducts)
  const [isLoading, setIsLoading] = useState(isCategoryId)
  const [hasApiError, setHasApiError] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    let isMounted = true

    const loadCategoryProducts = async () => {
      setIsLoading(true)
      setHasApiError(false)
      setSelectedSubCategory('all')

      if (!isCategoryId) {
        setCategory(fallbackCategory)
        setParentCategory(fallbackParentCategory)
        setChildCategories([])
        setCategoryProducts(fallbackProducts)
        setIsLoading(false)
        return
      }

      try {
        const apiCategory = await getCategoryById(categorySlug)
        const currentParentId = apiCategory?.parentId ?? fallbackCategory?.parentId
        const [apiParentCategory, apiChildCategories, apiProducts] = await Promise.all([
          currentParentId ? getCategoryById(currentParentId).catch(() => findMockCategory(currentParentId)) : null,
          getChildCategories(categorySlug),
          getProductsByCategoryTree(categorySlug),
        ])

        if (!isMounted) {
          return
        }

        setCategory(apiCategory || fallbackCategory)
        setParentCategory(apiParentCategory || fallbackParentCategory)
        setChildCategories(apiChildCategories)
        setCategoryProducts(apiProducts)
      } catch {
        if (!isMounted) {
          return
        }

        const fallbackCurrentCategory =
          fallbackCategory || {
            id: categorySlug,
            slug: categorySlug,
            name: `Danh mục ${categorySlug}`,
            description: '',
            productCount: fallbackProducts.length,
            parentId: null,
            subCategories: [],
          }

        setCategory(fallbackCurrentCategory)
        setParentCategory(findMockParentCategory(fallbackCurrentCategory))
        setChildCategories([])
        setCategoryProducts(fallbackProducts)
        setHasApiError(true)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategoryProducts()

    return () => {
      isMounted = false
    }
  }, [categorySlug, fallbackCategory, fallbackParentCategory, fallbackProducts, isCategoryId])

  const provinces = useMemo(() => {
    return [...new Set(categoryProducts.map((product) => product.province).filter(Boolean))].sort()
  }, [categoryProducts])

  const productTypes = useMemo(() => {
    return [...new Set(categoryProducts.map((product) => product.subCategory).filter(Boolean))].sort()
  }, [categoryProducts])

  const subCategoryOptions = useMemo(() => {
    const childOptions = childCategories.map((child) => ({
      id: normalizeId(child.id),
      name: child.name,
      slug: normalizeId(child.slug),
    }))
    const typeOptions = productTypes
      .filter((type) => !childOptions.some((child) => child.name === type))
      .map((type) => ({ id: type, name: type }))

    return [...childOptions, ...typeOptions]
  }, [childCategories, productTypes])

  const selectedSubCategoryOption = useMemo(() => {
    if (selectedSubCategory === 'all') {
      return null
    }

    return subCategoryOptions.find((option) => normalizeId(option.id) === normalizeId(selectedSubCategory)) || null
  }, [selectedSubCategory, subCategoryOptions])

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    const products = categoryProducts.filter((product) => {
      const selectedSubCategoryKeys = new Set(
        [
          selectedSubCategory,
          selectedSubCategoryOption?.id,
          selectedSubCategoryOption?.slug,
          selectedSubCategoryOption?.name,
        ]
          .filter(Boolean)
          .map(normalizeId),
      )
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        (product.province || product.origin || '').toLowerCase().includes(keyword)
      const matchesSubCategory =
        selectedSubCategory === 'all' ||
        selectedSubCategoryKeys.has(normalizeId(product.categoryId)) ||
        selectedSubCategoryKeys.has(normalizeId(product.categorySlug)) ||
        selectedSubCategoryKeys.has(normalizeId(product.categoryName)) ||
        selectedSubCategoryKeys.has(normalizeId(product.category)) ||
        selectedSubCategoryKeys.has(normalizeId(product.subCategory))
      const productProvince = product.province || product.origin || ''
      const matchesProvince = selectedProvince === 'all' || productProvince === selectedProvince
      const matchesType = selectedType === 'all' || product.subCategory === selectedType
      const matchesPrice = isInPriceRange(product, selectedPrice)

      return matchesSearch && matchesSubCategory && matchesProvince && matchesType && matchesPrice
    })

    return sortProducts(products, sortBy)
  }, [
    categoryProducts,
    searchText,
    selectedSubCategory,
    selectedSubCategoryOption,
    selectedProvince,
    selectedPrice,
    selectedType,
    sortBy,
  ])

  const resetFilters = () => {
    setSearchText('')
    setSelectedSubCategory('all')
    setSelectedProvince('all')
    setSelectedPrice('all')
    setSelectedType('all')
    setSortBy('newest')
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/categories')
  }

  if (!category) {
    return (
      <section className="page-card">
        <h1 className="page-title">
          {isLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy danh mục'}
        </h1>
        {hasApiError ? <p>Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
        <Link className="button" to="/categories">
          Quay lại danh mục
        </Link>
      </section>
    )
  }

  const productCount = category.productCount || categoryProducts.length
  const hasProductsBeforeFilter = categoryProducts.length > 0

  return (
    <div className="category-product-page">
      <div className="category-navigation">
        <button className="back-button" type="button" onClick={goBack}>
          ← Quay lại
        </button>
        <nav className="breadcrumb" aria-label="Đường dẫn danh mục">
          <Link to="/">Trang chủ</Link>
          <span>›</span>
          <Link to="/categories">Danh mục</Link>
          <span>›</span>
          {parentCategory ? (
            <>
              <Link to={`/categories/${parentCategory.id}`}>{parentCategory.name}</Link>
              <span>›</span>
            </>
          ) : null}
          <strong>{category.name}</strong>
        </nav>
      </div>

      <section className="category-title-panel">
        <div className="category-title-copy">
          <span>{productCount} san pham</span>
          <h1>{category.name}</h1>
          <p>{category.description || 'Dang cap nhat mo ta danh muc.'}</p>
        </div>
        <img
          src={getImageUrl(category.hinhAnh || category.image)}
          alt={category.name}
          onError={handleImageError}
        />
      </section>

      {childCategories.length > 0 ? (
        <section className="child-category-section">
          <div className="section-heading">
            <span>Danh mục con</span>
            <h2>Khám phá tiếp</h2>
          </div>
          <div className="child-category-list">
            {childCategories.map((child) => (
              <Link className="child-category-chip" key={child.id} to={`/categories/${child.id}`}>
                <strong>{child.name}</strong>
                {child.description ? <small>{child.description}</small> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isLoading ? <p className="product-result-summary">Đang tải dữ liệu...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

      <section className="category-product-layout">
        <aside className="category-product-filter">
          <div className="filter-header">
            <h2>Bộ lọc</h2>
            <button type="button" onClick={resetFilters}>
              Xóa lọc
            </button>
          </div>

          <div className="filter-group">
            <h3>Danh mục con</h3>
            <select
              value={selectedSubCategory}
              onChange={(event) => setSelectedSubCategory(event.target.value)}
            >
              <option value="all">Tất cả</option>
              {subCategoryOptions.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Tỉnh xuất xứ</h3>
            <select value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)}>
              <option value="all">Tất cả tỉnh</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Khoảng giá</h3>
            <select value={selectedPrice} onChange={(event) => setSelectedPrice(event.target.value)}>
              <option value="all">Tất cả mức giá</option>
              <option value="under-100">Dưới 100.000đ</option>
              <option value="100-300">100.000đ - 300.000đ</option>
              <option value="over-300">Trên 300.000đ</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Loại sản phẩm</h3>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              <option value="all">Tất cả loại</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div className="category-product-content">
          <div className="product-toolbar">
            <label className="product-search">
              <span>Tìm trong danh mục</span>
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={`Tìm ${category.name.toLowerCase()}...`}
              />
            </label>
            <label className="product-sort">
              <span>Sắp xếp</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
              </select>
            </label>
          </div>

          <p className="product-result-summary">
            <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
          </p>

          {filteredProducts.length > 0 ? (
            <div className="product-grid category-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <h2>
                {hasProductsBeforeFilter
                  ? 'Chưa có sản phẩm phù hợp'
                  : 'Chưa có sản phẩm trong danh mục này.'}
              </h2>
              <p>Thử đổi bộ lọc hoặc quay lại trang tổng quan danh mục.</p>
              {hasProductsBeforeFilter ? (
                <button className="button" type="button" onClick={resetFilters}>
                  Xóa bộ lọc
                </button>
              ) : (
                <Link className="button" to="/categories">
                  Xem danh mục khác
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CategoryProductPage
