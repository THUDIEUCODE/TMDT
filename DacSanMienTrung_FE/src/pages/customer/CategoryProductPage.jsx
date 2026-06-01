import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../../components/product/ProductCard'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'
import { getCategoryById } from '../../services/categoryService'
import { getProductsByCategory } from '../../services/productService'

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
  const isCategoryId = /^\d+$/.test(categorySlug)
  const fallbackCategory = useMemo(
    () => mockCategories.find((item) => item.slug === categorySlug || item.id === categorySlug),
    [categorySlug],
  )
  const [category, setCategory] = useState(fallbackCategory)
  const [categoryProducts, setCategoryProducts] = useState(() =>
    mockProducts.filter((product) => product.categorySlug === categorySlug),
  )
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

    const fallbackProducts = mockProducts.filter((product) => product.categorySlug === categorySlug)

    const loadCategoryProducts = async () => {
      setIsLoading(true)
      setHasApiError(false)

      if (!isCategoryId) {
        setCategory(fallbackCategory)
        setCategoryProducts(fallbackProducts)
        setIsLoading(false)
        return
      }

      try {
        const [apiCategory, apiProducts] = await Promise.all([
          getCategoryById(categorySlug),
          getProductsByCategory(categorySlug),
        ])

        if (!isMounted) {
          return
        }

        setCategory(apiCategory || fallbackCategory)
        setCategoryProducts(apiProducts.length > 0 ? apiProducts : fallbackProducts)
      } catch {
        if (!isMounted) {
          return
        }

        setCategory(fallbackCategory)
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
  }, [categorySlug, fallbackCategory, isCategoryId])

  const provinces = useMemo(() => {
    return [...new Set(categoryProducts.map((product) => product.province).filter(Boolean))].sort()
  }, [categoryProducts])

  const productTypes = useMemo(() => {
    return [...new Set(categoryProducts.map((product) => product.subCategory).filter(Boolean))].sort()
  }, [categoryProducts])

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    const products = categoryProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        (product.province || '').toLowerCase().includes(keyword)
      const matchesSubCategory =
        selectedSubCategory === 'all' || product.subCategory === selectedSubCategory
      const matchesProvince = selectedProvince === 'all' || product.province === selectedProvince
      const matchesType = selectedType === 'all' || product.subCategory === selectedType
      const matchesPrice = isInPriceRange(product, selectedPrice)

      return matchesSearch && matchesSubCategory && matchesProvince && matchesType && matchesPrice
    })

    return sortProducts(products, sortBy)
  }, [
    categoryProducts,
    searchText,
    selectedSubCategory,
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

  return (
    <div className="category-product-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/categories">Danh mục</Link>
        <span>›</span>
        <strong>{category.name}</strong>
      </nav>

      <section className="category-title-panel">
        <span>{category.productCount || categoryProducts.length} sản phẩm</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>

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
              {(category.subCategories || []).map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
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
              <h2>Chưa có sản phẩm phù hợp</h2>
              <p>Thử đổi bộ lọc hoặc quay lại trang tổng quan danh mục.</p>
              <button className="button" type="button" onClick={resetFilters}>
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CategoryProductPage
