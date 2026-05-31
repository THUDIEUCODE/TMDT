import { useMemo, useState } from 'react'
import { mockProducts } from '../../data/mockProducts'
import './ProductManagementPage.css'

const productDisplayNames = {
  'me-xung-hue': 'Mè xửng Huế',
  'mam-ruoc-hue': 'Mắm ruốc Huế',
  'muc-rim-me-da-nang': 'Mực rim me Đà Nẵng',
  'banh-kho-me-quang-nam': 'Bánh khô mè Quảng Nam',
  'toi-ly-son': 'Tỏi Lý Sơn',
  'cha-bo-da-nang': 'Chả bò Đà Nẵng',
  'nuoc-mam-nam-o': 'Nước mắm Nam Ô',
  'ca-kho-nha-trang': 'Cá khô Nha Trang',
  'yen-sao-khanh-hoa': 'Yến sào Khánh Hòa',
  'banh-trang-dai-loc': 'Bánh tráng Đại Lộc',
  'mi-quang-kho': 'Mì Quảng khô',
  'tra-cung-dinh-hue': 'Trà cung đình Huế',
  'hop-qua-mien-trung': 'Hộp quà đặc sản miền Trung',
}

const provinceLabels = {
  hue: 'Huế',
  'da-nang': 'Đà Nẵng',
  'quang-nam': 'Quảng Nam',
  'quang-ngai': 'Quảng Ngãi',
  'khanh-hoa': 'Khánh Hòa',
  'mien-trung': 'Miền Trung',
}

const categoryLabels = {
  'dac-san-hue': 'Đặc sản Huế',
  'dac-san-bien': 'Đặc sản biển',
  'dac-san-quang-nam': 'Đặc sản Quảng Nam',
  'dac-san-quang-ngai': 'Đặc sản Quảng Ngãi',
  'dac-san-da-nang': 'Đặc sản Đà Nẵng',
  'dac-san-khanh-hoa': 'Đặc sản Khánh Hòa',
  'dac-san-kho': 'Đặc sản khô',
  'qua-bieu-dac-san': 'Quà biếu đặc sản',
}

const productMeta = {
  'me-xung-hue': { province: 'hue', status: 'active' },
  'mam-ruoc-hue': { province: 'hue', status: 'active' },
  'muc-rim-me-da-nang': { province: 'da-nang', status: 'active' },
  'banh-kho-me-quang-nam': { province: 'quang-nam', status: 'active' },
  'toi-ly-son': { province: 'quang-ngai', status: 'active' },
  'cha-bo-da-nang': { province: 'da-nang', status: 'active' },
  'nuoc-mam-nam-o': { province: 'da-nang', status: 'active' },
  'ca-kho-nha-trang': { province: 'khanh-hoa', status: 'hidden' },
  'yen-sao-khanh-hoa': { province: 'khanh-hoa', status: 'active' },
  'banh-trang-dai-loc': { province: 'quang-nam', status: 'active' },
  'mi-quang-kho': { province: 'quang-nam', status: 'active' },
  'tra-cung-dinh-hue': { province: 'hue', status: 'active' },
  'hop-qua-mien-trung': { province: 'mien-trung', status: 'hidden' },
}

const statusLabels = {
  active: 'Đang bán',
  hidden: 'Đang ẩn',
  lowStock: 'Sắp hết hàng',
}

const formStatusLabels = {
  active: 'Đang bán',
  hidden: 'Đang ẩn',
}

const emptyForm = {
  name: '',
  categorySlug: 'dac-san-hue',
  provinceKey: 'hue',
  price: '',
  oldPrice: '',
  imageUrl: '',
  shortDescription: '',
  status: 'active',
}

const emptyVariantForm = {
  name: '',
  weight: '',
  sku: '',
  price: '',
  stock: '',
  status: 'active',
}

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

const createSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getTotalStock = (product) =>
  product.variants?.reduce((total, variant) => total + Number(variant.stock || 0), 0) ||
  product.stock ||
  0

const getProductName = (product) => product.manageName || productDisplayNames[product.id] || product.name

const getVariantName = (product, variant) => {
  if (variant.name) {
    return variant.name
  }

  if (product.id === 'mam-ruoc-hue') {
    return `Hũ ${variant.label}`
  }

  if (product.id === 'me-xung-hue') {
    return variant.label?.toLowerCase().includes('hộp') ? 'Hộp quà 1kg' : `Gói ${variant.label}`
  }

  return variant.label || 'Biến thể sản phẩm'
}

const getVariantWeight = (variant) => variant.weight || variant.label || 'Tiêu chuẩn'

const getVariantSku = (product, variant) =>
  variant.sku || `${product.slug}-${variant.id || createSlug(variant.label || 'variant')}`.toUpperCase()

function ProductManagementPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [provinceFilter, setProvinceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [variantProductId, setVariantProductId] = useState(null)
  const [variantFormMode, setVariantFormMode] = useState(null)
  const [editingVariantId, setEditingVariantId] = useState(null)
  const [variantForm, setVariantForm] = useState(emptyVariantForm)

  const openAddModal = () => {
    setModalMode('add')
    setEditingProductId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (product) => {
    const meta = productMeta[product.id] || {}
    const totalStock = getTotalStock(product)
    const currentStatus = product.manageStatus || meta.status || 'active'

    setModalMode('edit')
    setEditingProductId(product.id)
    setFormData({
      name: getProductName(product),
      categorySlug: product.categorySlug,
      provinceKey: product.manageProvince || meta.province || 'mien-trung',
      price: String(product.price || ''),
      oldPrice: String(product.oldPrice || ''),
      imageUrl: product.imageUrl || '',
      shortDescription: product.shortDescription || product.description || '',
      status: totalStock <= 20 && currentStatus === 'active' ? 'active' : currentStatus,
    })
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingProductId(null)
    setFormData(emptyForm)
  }

  const openVariantModal = (productId) => {
    setVariantProductId(productId)
    setVariantFormMode(null)
    setEditingVariantId(null)
    setVariantForm(emptyVariantForm)
  }

  const closeVariantModal = () => {
    setVariantProductId(null)
    setVariantFormMode(null)
    setEditingVariantId(null)
    setVariantForm(emptyVariantForm)
  }

  const openAddVariantForm = () => {
    setVariantFormMode('add')
    setEditingVariantId(null)
    setVariantForm(emptyVariantForm)
  }

  const openEditVariantForm = (product, variant) => {
    setVariantFormMode('edit')
    setEditingVariantId(variant.id)
    setVariantForm({
      name: getVariantName(product, variant),
      weight: getVariantWeight(variant),
      sku: getVariantSku(product, variant),
      price: String(variant.price || ''),
      stock: String(variant.stock || ''),
      status: variant.status || 'active',
    })
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleVariantFormChange = (event) => {
    const { name, value } = event.target
    setVariantForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveProduct = (event) => {
    event.preventDefault()

    const normalizedName = formData.name.trim()
    const nextProductData = {
      manageName: normalizedName,
      categorySlug: formData.categorySlug,
      categoryId: formData.categorySlug,
      manageProvince: formData.provinceKey,
      origin: provinceLabels[formData.provinceKey],
      province: provinceLabels[formData.provinceKey],
      price: Number(formData.price) || 0,
      oldPrice: Number(formData.oldPrice) || 0,
      imageUrl: formData.imageUrl.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.shortDescription.trim(),
      manageStatus: formData.status,
    }

    if (modalMode === 'edit') {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProductId ? { ...product, ...nextProductData } : product,
        ),
      )
    } else {
      const slug = createSlug(normalizedName) || `san-pham-${Date.now()}`
      setProducts((currentProducts) => [
        {
          ...nextProductData,
          id: `${slug}-${Date.now()}`,
          slug,
          image: normalizedName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join(''),
          rating: 0,
          stock: 0,
          variants: [],
        },
        ...currentProducts,
      ])
    }

    closeModal()
  }

  const handleSaveVariant = (event) => {
    event.preventDefault()

    const nextVariantData = {
      name: variantForm.name.trim(),
      label: variantForm.weight.trim(),
      weight: variantForm.weight.trim(),
      sku: variantForm.sku.trim(),
      price: Number(variantForm.price) || 0,
      stock: Number(variantForm.stock) || 0,
      status: variantForm.status,
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== variantProductId) {
          return product
        }

        if (variantFormMode === 'edit') {
          return {
            ...product,
            variants: product.variants.map((variant) =>
              variant.id === editingVariantId ? { ...variant, ...nextVariantData } : variant,
            ),
          }
        }

        return {
          ...product,
          variants: [
            ...product.variants,
            {
              ...nextVariantData,
              id: `variant-${Date.now()}`,
            },
          ],
        }
      }),
    )

    setVariantFormMode(null)
    setEditingVariantId(null)
    setVariantForm(emptyVariantForm)
  }

  const toggleVariantStatus = (variantId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === variantProductId
          ? {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId
                  ? {
                      ...variant,
                      status: (variant.status || 'active') === 'hidden' ? 'active' : 'hidden',
                    }
                  : variant,
              ),
            }
          : product,
      ),
    )
  }

  const rows = useMemo(() => {
    return products.map((product) => {
      const totalStock = getTotalStock(product)
      const meta = productMeta[product.id] || { province: 'mien-trung', status: 'active' }
      const baseStatus = product.manageStatus || meta.status
      const status = totalStock <= 20 && baseStatus === 'active' ? 'lowStock' : baseStatus
      const provinceKey = product.manageProvince || meta.province

      return {
        ...product,
        displayName: getProductName(product),
        displayCategory: categoryLabels[product.categorySlug] || product.categorySlug,
        displayProvince: provinceLabels[provinceKey] || product.origin,
        provinceKey,
        status,
        totalStock,
        variantCount: product.variants?.length || 0,
      }
    })
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return rows.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.displayName.toLowerCase().includes(normalizedSearch) ||
        product.displayCategory.toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        categoryFilter === 'all' || product.categorySlug === categoryFilter
      const matchesProvince = provinceFilter === 'all' || product.provinceKey === provinceFilter
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter

      return matchesSearch && matchesCategory && matchesProvince && matchesStatus
    })
  }, [categoryFilter, provinceFilter, rows, searchTerm, statusFilter])

  const variantProduct = products.find((product) => product.id === variantProductId)

  return (
    <div className="product-management-page">
      <section className="product-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý sản phẩm</h1>
          <p>Theo dõi danh sách sản phẩm, tồn kho và trạng thái hiển thị trên cửa hàng.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm sản phẩm
        </button>
      </section>

      <section className="product-management-toolbar">
        <label className="product-search-field">
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập tên sản phẩm hoặc danh mục"
          />
        </label>

        <label>
          Danh mục
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tỉnh thành
          <select
            value={provinceFilter}
            onChange={(event) => setProvinceFilter(event.target.value)}
          >
            <option value="all">Tất cả tỉnh thành</option>
            {Object.entries(provinceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="product-management-table-card">
        <div className="product-table-summary">
          <strong>{filteredProducts.length} sản phẩm</strong>
          <span>Dữ liệu mock, các nút thao tác chỉ cập nhật state trong frontend.</span>
        </div>

        <div className="product-management-table">
          <div className="product-table-head">
            <span>Ảnh</span>
            <span>Tên sản phẩm</span>
            <span>Danh mục</span>
            <span>Xuất xứ</span>
            <span>Giá bán</span>
            <span>Tổng tồn kho</span>
            <span>Số biến thể</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredProducts.map((product) => (
            <article className="product-table-row" key={product.id}>
              <div className="staff-product-image">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.displayName} /> : product.image}
              </div>
              <div className="staff-product-name">
                <strong>{product.displayName}</strong>
                <span>{product.slug}</span>
              </div>
              <span>{product.displayCategory}</span>
              <span>{product.displayProvince}</span>
              <strong className="product-price">{formatCurrency(product.price)}</strong>
              <span>{product.totalStock}</span>
              <span>{product.variantCount}</span>
              <span className={`product-status product-status-${product.status}`}>
                {statusLabels[product.status]}
              </span>
              <div className="product-actions">
                <button type="button">Xem</button>
                <button type="button" onClick={() => openEditModal(product)}>
                  Sửa
                </button>
                <button type="button" onClick={() => openVariantModal(product.id)}>
                  Quản lý biến thể
                </button>
                <button type="button">{product.status === 'hidden' ? 'Hiện' : 'Ẩn'}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {modalMode ? (
        <div className="product-modal-backdrop" role="presentation">
          <form className="product-modal" onSubmit={handleSaveProduct}>
            <div className="product-modal-heading">
              <span>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{modalMode === 'add' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h2>
            </div>

            <div className="product-form-grid">
              <label>
                Tên sản phẩm
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nhập tên sản phẩm"
                />
              </label>

              <label>
                Danh mục
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleFormChange}
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tỉnh xuất xứ
                <select
                  name="provinceKey"
                  value={formData.provinceKey}
                  onChange={handleFormChange}
                >
                  {Object.entries(provinceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Giá bán
                <input
                  required
                  min="0"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="0"
                />
              </label>

              <label>
                Giá cũ
                <input
                  min="0"
                  name="oldPrice"
                  type="number"
                  value={formData.oldPrice}
                  onChange={handleFormChange}
                  placeholder="0"
                />
              </label>

              <label>
                Ảnh URL
                <input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
              </label>

              <label>
                Trạng thái
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  {Object.entries(formStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="product-form-full">
                Mô tả ngắn
                <textarea
                  name="shortDescription"
                  rows="4"
                  value={formData.shortDescription}
                  onChange={handleFormChange}
                  placeholder="Nhập mô tả ngắn cho sản phẩm"
                />
              </label>
            </div>

            <div className="product-modal-actions">
              <button type="button" onClick={closeModal}>
                Hủy
              </button>
              <button className="button" type="submit">
                Lưu
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {variantProduct ? (
        <div className="product-modal-backdrop" role="presentation">
          <section className="product-modal variant-modal">
            <div className="product-modal-heading">
              <span>Biến thể sản phẩm</span>
              <h2>{getProductName(variantProduct)}</h2>
            </div>

            <div className="variant-modal-top">
              <p>
                Tổng tồn kho: <strong>{getTotalStock(variantProduct)}</strong>
              </p>
              <button className="button" type="button" onClick={openAddVariantForm}>
                Thêm biến thể
              </button>
            </div>

            <div className="variant-table">
              <div className="variant-table-head">
                <span>Tên biến thể</span>
                <span>Trọng lượng / quy cách</span>
                <span>SKU</span>
                <span>Giá bán</span>
                <span>Tồn kho</span>
                <span>Trạng thái</span>
                <span>Thao tác</span>
              </div>

              {variantProduct.variants.map((variant) => (
                <article className="variant-table-row" key={variant.id}>
                  <strong>{getVariantName(variantProduct, variant)}</strong>
                  <span>{getVariantWeight(variant)}</span>
                  <span>{getVariantSku(variantProduct, variant)}</span>
                  <span>{formatCurrency(variant.price)}</span>
                  <span>{variant.stock}</span>
                  <span className={`product-status product-status-${variant.status || 'active'}`}>
                    {formStatusLabels[variant.status || 'active']}
                  </span>
                  <div className="product-actions">
                    <button type="button" onClick={() => openEditVariantForm(variantProduct, variant)}>
                      Sửa
                    </button>
                    <button type="button" onClick={() => toggleVariantStatus(variant.id)}>
                      {(variant.status || 'active') === 'hidden' ? 'Hiện' : 'Ẩn'}
                    </button>
                  </div>
                </article>
              ))}

              {variantProduct.variants.length === 0 ? (
                <p className="variant-empty">Sản phẩm này chưa có biến thể.</p>
              ) : null}
            </div>

            {variantFormMode ? (
              <form className="variant-form" onSubmit={handleSaveVariant}>
                <h3>{variantFormMode === 'add' ? 'Thêm biến thể' : 'Sửa biến thể'}</h3>
                <div className="product-form-grid">
                  <label>
                    Tên biến thể
                    <input
                      required
                      name="name"
                      value={variantForm.name}
                      onChange={handleVariantFormChange}
                      placeholder="Ví dụ: Gói 250g"
                    />
                  </label>
                  <label>
                    Trọng lượng
                    <input
                      required
                      name="weight"
                      value={variantForm.weight}
                      onChange={handleVariantFormChange}
                      placeholder="Ví dụ: 250g"
                    />
                  </label>
                  <label>
                    SKU
                    <input
                      required
                      name="sku"
                      value={variantForm.sku}
                      onChange={handleVariantFormChange}
                      placeholder="VD: MX-HUE-250G"
                    />
                  </label>
                  <label>
                    Giá bán
                    <input
                      required
                      min="0"
                      name="price"
                      type="number"
                      value={variantForm.price}
                      onChange={handleVariantFormChange}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    Số lượng tồn
                    <input
                      required
                      min="0"
                      name="stock"
                      type="number"
                      value={variantForm.stock}
                      onChange={handleVariantFormChange}
                      placeholder="0"
                    />
                  </label>
                  <label>
                    Trạng thái
                    <select name="status" value={variantForm.status} onChange={handleVariantFormChange}>
                      {Object.entries(formStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="product-modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setVariantFormMode(null)
                      setEditingVariantId(null)
                      setVariantForm(emptyVariantForm)
                    }}
                  >
                    Hủy
                  </button>
                  <button className="button" type="submit">
                    Lưu biến thể
                  </button>
                </div>
              </form>
            ) : null}

            <div className="product-modal-actions">
              <button type="button" onClick={closeVariantModal}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ProductManagementPage
