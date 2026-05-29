import { useMemo, useState } from 'react'
import ProductFilter from '../../components/product/ProductFilter'
import ProductCard from '../../components/product/ProductCard'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'

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

  if (sortBy === 'stock-desc') {
    return sortedProducts.sort((a, b) => b.stock - a.stock)
  }

  return sortedProducts
}

function ProductListPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  const provinces = useMemo(() => {
    return [...new Set(mockProducts.map((product) => product.origin))].sort()
  }, [])

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    const products = mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.origin.toLowerCase().includes(keyword)
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
      const matchesProvince = selectedProvince === 'all' || product.origin === selectedProvince
      const matchesPrice = isInPriceRange(product, selectedPrice)

      return matchesSearch && matchesCategory && matchesProvince && matchesPrice
    })

    return sortProducts(products, sortBy)
  }, [searchText, selectedCategory, selectedProvince, selectedPrice, sortBy])

  const resetFilters = () => {
    setSearchText('')
    setSelectedCategory('all')
    setSelectedProvince('all')
    setSelectedPrice('all')
    setSortBy('featured')
  }

  return (
    <div className="product-list-page">
      <section className="product-list-hero">
        <span>Đặc sản tuyển chọn</span>
        <h1>Danh sách sản phẩm</h1>
        <p>
          Tìm đặc sản miền Trung theo danh mục, tỉnh xuất xứ, khoảng giá và nhu cầu làm quà.
        </p>
      </section>

      <section className="product-list-layout">
        <ProductFilter
          categories={mockCategories}
          provinces={provinces}
          selectedCategory={selectedCategory}
          selectedProvince={selectedProvince}
          selectedPrice={selectedPrice}
          onCategoryChange={setSelectedCategory}
          onProvinceChange={setSelectedProvince}
          onPriceChange={setSelectedPrice}
          onReset={resetFilters}
        />

        <div className="product-list-content">
          <div className="product-toolbar">
            <label className="product-search">
              <span>Tìm kiếm</span>
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Nhập tên sản phẩm hoặc tỉnh..."
              />
            </label>

            <label className="product-sort">
              <span>Sắp xếp</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Nổi bật</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="stock-desc">Tồn kho nhiều</option>
              </select>
            </label>
          </div>

          <div className="product-result-summary">
            <strong>{filteredProducts.length}</strong> sản phẩm phù hợp
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <h2>Không tìm thấy sản phẩm</h2>
              <p>Thử đổi từ khóa, danh mục hoặc khoảng giá để xem thêm đặc sản khác.</p>
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

export default ProductListPage
