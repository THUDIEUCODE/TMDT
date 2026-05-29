const priceRanges = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: 'under-100', label: 'Dưới 100.000đ' },
  { value: '100-300', label: '100.000đ - 300.000đ' },
  { value: 'over-300', label: 'Trên 300.000đ' },
]

function ProductFilter({
  categories,
  provinces,
  selectedCategory,
  selectedProvince,
  selectedPrice,
  onCategoryChange,
  onProvinceChange,
  onPriceChange,
  onReset,
}) {
  return (
    <aside className="product-filter">
      <div className="filter-header">
        <h2>Bộ lọc</h2>
        <button type="button" onClick={onReset}>
          Xóa lọc
        </button>
      </div>

      <div className="filter-group">
        <h3>Danh mục</h3>
        <label className="filter-option">
          <input
            type="radio"
            name="category"
            checked={selectedCategory === 'all'}
            onChange={() => onCategoryChange('all')}
          />
          <span>Tất cả danh mục</span>
        </label>
        {categories.map((category) => (
          <label className="filter-option" key={category.id}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === category.id}
              onChange={() => onCategoryChange(category.id)}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h3>Tỉnh xuất xứ</h3>
        <select value={selectedProvince} onChange={(event) => onProvinceChange(event.target.value)}>
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
        <select value={selectedPrice} onChange={(event) => onPriceChange(event.target.value)}>
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}

export default ProductFilter
