import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'
import { getManageCategories, mapCategoryFromApi } from '../../services/categoryService'
import {
  createProduct,
  getManageProductById,
  getManageProducts,
  mapProductFromApi,
  toggleProduct,
  updateProduct,
} from '../../services/productService'
import {
  createVariant,
  getVariantsByProduct,
  toggleVariant,
  updateVariant,
} from '../../services/variantService'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'
import './ProductManagementPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatDate = (value) => {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const fallbackProducts = mockProducts.map(mapProductFromApi)
const fallbackCategories = mockCategories.map(mapCategoryFromApi)

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang bán' },
  { value: 'hidden', label: 'Tạm ẩn' },
  { value: 'outOfStock', label: 'Hết hàng' },
]

const emptyProductForm = {
  maDanhMuc: '',
  tenSanPham: '',
  moTa: '',
  thanhPhan: '',
  huongDanBaoQuan: '',
  dacTrungVanHoa: '',
  lichSuSanPham: '',
  tenTinh: '',
  vungMien: '',
  moTaVanHoaTinh: '',
  giaNiemYet: '',
  hinhAnh: '',
  trangThai: 'true',
}

const emptyVariantForm = {
  trongLuong: '',
  quyCachDongGoi: '',
  giaBan: '',
  soLuongTon: '',
  hanSuDung: '',
  hinhAnh: '',
  trangThai: 'true',
}

const getTotalStock = (product) => Number(product.stock ?? 0)
const getProductStatusKey = (product) => {
  if (!product.status) return 'hidden'
  if (getTotalStock(product) === 0) return 'outOfStock'
  return 'active'
}
const getProductStatusLabel = (product) => statusOptions.find((item) => item.value === getProductStatusKey(product))?.label
const getToggleConfirmMessage = (isActive) =>
  isActive ? 'Bạn có chắc muốn tạm ẩn mục này không?' : 'Bạn có chắc muốn hiện lại mục này không?'

function ProductManagementPage() {
  const [products, setProducts] = useState(fallbackProducts)
  const [categories, setCategories] = useState(fallbackCategories)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [provinceFilter, setProvinceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailProduct, setDetailProduct] = useState(null)
  const [productFormMode, setProductFormMode] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [variantProduct, setVariantProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [variantFormMode, setVariantFormMode] = useState(null)
  const [editingVariant, setEditingVariant] = useState(null)
  const [variantForm, setVariantForm] = useState(emptyVariantForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadProducts = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true)

    try {
      const [apiProducts, apiCategories] = await Promise.all([getManageProducts(), getManageCategories()])
      setProducts(apiProducts)
      setCategories(apiCategories.length > 0 ? apiCategories : fallbackCategories)
      setHasApiError(false)
    } catch {
      setProducts(fallbackProducts)
      setCategories(fallbackCategories)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => loadProducts())
  }, [loadProducts])

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map()
    categories.forEach((category) => categoryMap.set(String(category.id), category.name))
    products.forEach((product) => {
      if (product.categoryId && product.categoryName) categoryMap.set(String(product.categoryId), product.categoryName)
    })
    return Array.from(categoryMap.entries()).map(([value, label]) => ({ value, label }))
  }, [categories, products])

  const provinceOptions = useMemo(() => [...new Set(products.map((product) => product.province).filter(Boolean))].sort(), [products])

  const stats = useMemo(() => {
    return products.reduce(
      (result, product) => {
        const statusKey = getProductStatusKey(product)
        result.total += 1
        result.variantCount += Number(product.variantCount || product.variants?.length || 0)
        result.stock += getTotalStock(product)
        if (statusKey === 'active') result.active += 1
        if (statusKey === 'hidden') result.hidden += 1
        if (statusKey === 'outOfStock') result.outOfStock += 1
        return result
      },
      { total: 0, active: 0, hidden: 0, outOfStock: 0, variantCount: 0, stock: 0 },
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const statusKey = getProductStatusKey(product)
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.categoryName.toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'all' || String(product.categoryId) === String(categoryFilter)
      const matchesProvince = provinceFilter === 'all' || product.province === provinceFilter
      const matchesStatus = statusFilter === 'all' || statusKey === statusFilter
      return matchesSearch && matchesCategory && matchesProvince && matchesStatus
    })
  }, [categoryFilter, products, provinceFilter, searchTerm, statusFilter])

  const loadProductDetail = async (product) => {
    setActionError('')
    setActionMessage('')
    setIsDetailLoading(true)
    setDetailProduct(product)
    try {
      setDetailProduct(await getManageProductById(product.id))
    } catch (error) {
      setActionError(error?.message || 'Không thể tải chi tiết sản phẩm từ backend.')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const openAddProduct = () => {
    setActionError('')
    setActionMessage('')
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setProductFormMode('add')
  }

  const openEditProduct = (product) => {
    setActionError('')
    setActionMessage('')
    setEditingProduct(product)
    setProductForm({
      maDanhMuc: product.categoryId || '',
      tenSanPham: product.name || '',
      moTa: product.description || '',
      thanhPhan: product.ingredients || '',
      huongDanBaoQuan: product.storageGuide || '',
      dacTrungVanHoa: product.culturalStory || '',
      lichSuSanPham: product.history || '',
      tenTinh: product.province || '',
      vungMien: product.region || '',
      moTaVanHoaTinh: product.provinceCulture || '',
      giaNiemYet: String(product.listedPrice || 0),
      hinhAnh: product.imageUrl || '',
      trangThai: product.status ? 'true' : 'false',
    })
    setProductFormMode('edit')
  }

  const handleProductFormChange = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  const validateProductForm = () => {
    if (!productForm.maDanhMuc) return 'Danh mục bắt buộc.'
    if (!productForm.tenSanPham.trim()) return 'Tên sản phẩm không được rỗng.'
    if (productForm.giaNiemYet === '' || Number(productForm.giaNiemYet) < 0) return 'Giá niêm yết phải lớn hơn hoặc bằng 0.'
    return ''
  }

  const buildProductPayload = () => ({
    maDanhMuc: Number(productForm.maDanhMuc),
    tenSanPham: productForm.tenSanPham.trim(),
    moTa: productForm.moTa.trim(),
    thanhPhan: productForm.thanhPhan.trim(),
    huongDanBaoQuan: productForm.huongDanBaoQuan.trim(),
    dacTrungVanHoa: productForm.dacTrungVanHoa.trim(),
    lichSuSanPham: productForm.lichSuSanPham.trim(),
    tenTinh: productForm.tenTinh.trim(),
    vungMien: productForm.vungMien.trim(),
    moTaVanHoaTinh: productForm.moTaVanHoaTinh.trim(),
    giaNiemYet: Number(productForm.giaNiemYet),
    hinhAnh: productForm.hinhAnh.trim(),
    trangThai: productForm.trangThai === 'true',
  })

  const saveProduct = async (event) => {
    event.preventDefault()
    const validationMessage = validateProductForm()
    if (validationMessage) {
      setActionError(validationMessage)
      return
    }

    setIsSaving(true)
    setActionError('')
    try {
      if (productFormMode === 'edit') {
        await updateProduct(editingProduct.id, buildProductPayload())
        setActionMessage('Đã cập nhật sản phẩm.')
      } else {
        await createProduct(buildProductPayload())
        setActionMessage('Đã thêm sản phẩm.')
      }
      setProductFormMode(null)
      setEditingProduct(null)
      setProductForm(emptyProductForm)
      await loadProducts()
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleProduct = async (product) => {
    if (!window.confirm(getToggleConfirmMessage(product.status))) return

    setIsSaving(true)
    setActionError('')
    try {
      await toggleProduct(product.id)
      setActionMessage(product.status ? 'Đã ẩn sản phẩm.' : 'Đã hiện sản phẩm.')
      await loadProducts()
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const loadVariants = useCallback(async (product) => {
    setIsDetailLoading(true)
    setActionError('')
    try {
      setVariants(await getVariantsByProduct(product.id))
    } catch (error) {
      setVariants([])
      setActionError(error?.message || 'Không thể tải biến thể từ backend.')
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  const openVariantModal = async (product) => {
    setVariantProduct(product)
    setVariantFormMode(null)
    setEditingVariant(null)
    setVariantForm(emptyVariantForm)
    await loadVariants(product)
  }

  const openAddVariant = () => {
    setEditingVariant(null)
    setVariantForm(emptyVariantForm)
    setVariantFormMode('add')
  }

  const openEditVariant = (variant) => {
    setEditingVariant(variant)
    setVariantForm({
      trongLuong: variant.weight || '',
      quyCachDongGoi: variant.packaging || '',
      giaBan: String(variant.price || 0),
      soLuongTon: String(variant.stock || 0),
      hanSuDung: variant.expiryDate || '',
      hinhAnh: variant.image || '',
      trangThai: variant.status ? 'true' : 'false',
    })
    setVariantFormMode('edit')
  }

  const handleVariantFormChange = (event) => {
    const { name, value } = event.target
    setVariantForm((current) => ({ ...current, [name]: value }))
  }

  const validateVariantForm = () => {
    if (variantForm.giaBan === '' || Number(variantForm.giaBan) < 0) return 'Giá bán phải lớn hơn hoặc bằng 0.'
    if (variantForm.soLuongTon === '' || Number(variantForm.soLuongTon) < 0) return 'Số lượng tồn phải lớn hơn hoặc bằng 0.'
    return ''
  }

  const buildVariantPayload = () => ({
    maSanPham: Number(variantProduct.id),
    trongLuong: variantForm.trongLuong.trim(),
    quyCachDongGoi: variantForm.quyCachDongGoi.trim(),
    giaBan: Number(variantForm.giaBan),
    soLuongTon: Number(variantForm.soLuongTon),
    hanSuDung: variantForm.hanSuDung || null,
    hinhAnh: variantForm.hinhAnh.trim(),
    trangThai: variantForm.trangThai === 'true',
  })

  const saveVariant = async (event) => {
    event.preventDefault()
    const validationMessage = validateVariantForm()
    if (validationMessage) {
      setActionError(validationMessage)
      return
    }

    setIsSaving(true)
    setActionError('')
    try {
      if (variantFormMode === 'edit') {
        await updateVariant(editingVariant.id, buildVariantPayload())
        setActionMessage('Đã cập nhật biến thể.')
      } else {
        await createVariant(buildVariantPayload())
        setActionMessage('Đã thêm biến thể.')
      }
      setVariantFormMode(null)
      setEditingVariant(null)
      setVariantForm(emptyVariantForm)
      await loadVariants(variantProduct)
      await loadProducts({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVariant = async (variant) => {
    if (!window.confirm(getToggleConfirmMessage(variant.status))) return

    setIsSaving(true)
    setActionError('')
    try {
      await toggleVariant(variant.id)
      setActionMessage(variant.status ? 'Đã ẩn biến thể.' : 'Đã hiện biến thể.')
      await loadVariants(variantProduct)
      await loadProducts({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="product-management-page">
      <section className="product-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý sản phẩm</h1>
          <p>Theo dõi danh sách sản phẩm thật từ backend, tồn kho, trạng thái và biến thể.</p>
        </div>
        <button className="button" type="button" onClick={openAddProduct}>Thêm sản phẩm</button>
      </section>

      <section className="product-stat-grid">
        <article><span>Tổng sản phẩm</span><strong>{stats.total}</strong></article>
        <article><span>Đang bán</span><strong>{stats.active}</strong></article>
        <article><span>Tạm ẩn</span><strong>{stats.hidden}</strong></article>
        <article><span>Hết hàng</span><strong>{stats.outOfStock}</strong></article>
        <article><span>Tổng biến thể</span><strong>{stats.variantCount}</strong></article>
        <article><span>Tổng tồn kho</span><strong>{stats.stock}</strong></article>
      </section>

      {isLoading ? <p className="product-management-message">Đang tải sản phẩm...</p> : null}
      {hasApiError ? <p className="product-management-message">Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
      {actionMessage ? <p className="product-management-success">{actionMessage}</p> : null}
      {actionError ? <p className="product-management-error">{actionError}</p> : null}

      <section className="product-management-toolbar">
        <label className="product-search-field">Tìm kiếm<input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Nhập tên sản phẩm" /></label>
        <label>Danh mục<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">Tất cả danh mục</option>{categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
        <label>Tỉnh thành<select value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)}><option value="all">Tất cả tỉnh thành</option>{provinceOptions.map((province) => <option key={province} value={province}>{province}</option>)}</select></label>
        <label>Trạng thái<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </section>

      <section className="product-management-table-card">
        <div className="product-table-summary"><strong>{filteredProducts.length} sản phẩm</strong><span>Dữ liệu được tải từ backend khi kết nối thành công.</span></div>
        <div className="product-management-table">
          <div className="product-table-head"><span>Ảnh</span><span>Tên sản phẩm</span><span>Danh mục</span><span>Tỉnh/thành</span><span>Vùng miền</span><span>Giá niêm yết</span><span>Giá thấp nhất</span><span>Tồn kho</span><span>Biến thể</span><span>Trạng thái</span><span>Thao tác</span></div>
          {filteredProducts.map((product) => (
            <article className="product-table-row" key={product.id}>
              <div className="staff-product-image">
                <img
                  src={getImageUrl(product.hinhAnh || product.imageUrl || product.image)}
                  alt={product.name}
                  onError={handleImageError}
                />
              </div>
              <div className="staff-product-name"><strong>{product.name}</strong><span>{product.slug}</span></div>
              <span>{product.categoryName || 'Đang cập nhật'}</span>
              <span>{product.province || 'Đang cập nhật'}</span>
              <span>{product.region || 'Đang cập nhật'}</span>
              <strong className="product-price">{formatCurrency(product.listedPrice)}</strong>
              <strong className="product-price">{formatCurrency(product.price)}</strong>
              <span>{getTotalStock(product)}</span>
              <span>{product.variantCount || product.variants?.length || 0}</span>
              <span className={`product-status product-status-${getProductStatusKey(product)}`}>{getProductStatusLabel(product)}</span>
              <div className="product-actions">
                <button type="button" disabled={isSaving} onClick={() => loadProductDetail(product)}>Xem chi tiết</button>
                <button type="button" disabled={isSaving} onClick={() => openVariantModal(product)}>Quản lý biến thể</button>
                <button type="button" disabled={isSaving} onClick={() => openEditProduct(product)}>Sửa</button>
                <button type="button" disabled={isSaving} onClick={() => handleToggleProduct(product)}>{product.status ? 'Tạm ẩn' : 'Hiện lại'}</button>
              </div>
            </article>
          ))}
          {filteredProducts.length === 0 && !isLoading ? <section className="empty-products"><h2>Chưa có sản phẩm phù hợp</h2><p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p></section> : null}
        </div>
      </section>

      {detailProduct ? (
        <div className="product-modal-backdrop" role="presentation">
          <section className="product-modal product-detail-modal">
            <div className="product-modal-heading"><span>Chi tiết sản phẩm</span><h2>{detailProduct.name}</h2></div>
            {isDetailLoading ? <p className="product-management-message">Đang tải chi tiết sản phẩm...</p> : null}
            <div className="product-detail-grid">
              <div><span>Danh mục</span><strong>{detailProduct.categoryName || 'Đang cập nhật'}</strong></div>
              <div><span>Tỉnh/thành</span><strong>{detailProduct.province || 'Đang cập nhật'}</strong></div>
              <div><span>Vùng miền</span><strong>{detailProduct.region || 'Đang cập nhật'}</strong></div>
              <div><span>Giá niêm yết</span><strong>{formatCurrency(detailProduct.listedPrice)}</strong></div>
              <div><span>Giá thấp nhất</span><strong>{formatCurrency(detailProduct.price)}</strong></div>
              <div><span>Trạng thái</span><strong>{getProductStatusLabel(detailProduct)}</strong></div>
              <div className="product-detail-full"><span>Hình ảnh</span><strong>{detailProduct.imageUrl || detailProduct.image || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Mô tả</span><strong>{detailProduct.description || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Thành phần</span><strong>{detailProduct.ingredients || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Hướng dẫn bảo quản</span><strong>{detailProduct.storageGuide || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Đặc trưng văn hóa</span><strong>{detailProduct.culturalStory || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Lịch sử sản phẩm</span><strong>{detailProduct.history || 'Đang cập nhật'}</strong></div>
              <div className="product-detail-full"><span>Mô tả văn hóa tỉnh</span><strong>{detailProduct.provinceCulture || 'Đang cập nhật'}</strong></div>
            </div>
            <div className="product-modal-actions"><button type="button" onClick={() => setDetailProduct(null)}>Đóng</button></div>
          </section>
        </div>
      ) : null}

      {productFormMode ? (
        <div className="product-modal-backdrop" role="presentation">
          <form className="product-modal product-detail-modal" onSubmit={saveProduct}>
            <div className="product-modal-heading"><span>{productFormMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span><h2>{productFormMode === 'add' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h2></div>
            <div className="product-form-grid">
              <label>Danh mục<select name="maDanhMuc" value={productForm.maDanhMuc} onChange={handleProductFormChange}><option value="">Chọn danh mục</option>{categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
              <label>Tên sản phẩm<input name="tenSanPham" value={productForm.tenSanPham} onChange={handleProductFormChange} /></label>
              <label>Tỉnh/thành<input name="tenTinh" value={productForm.tenTinh} onChange={handleProductFormChange} /></label>
              <label>Vùng miền<input name="vungMien" value={productForm.vungMien} onChange={handleProductFormChange} /></label>
              <label>Giá niêm yết<input name="giaNiemYet" type="number" min="0" value={productForm.giaNiemYet} onChange={handleProductFormChange} /></label>
              <label>Hình ảnh<input name="hinhAnh" value={productForm.hinhAnh} onChange={handleProductFormChange} /></label>
              <label>Trạng thái<select name="trangThai" value={productForm.trangThai} onChange={handleProductFormChange}><option value="true">Đang bán</option><option value="false">Tạm ẩn</option></select></label>
              <label className="product-form-full">Mô tả<textarea name="moTa" rows="3" value={productForm.moTa} onChange={handleProductFormChange} /></label>
              <label className="product-form-full">Thành phần<textarea name="thanhPhan" rows="3" value={productForm.thanhPhan} onChange={handleProductFormChange} /></label>
              <label className="product-form-full">Hướng dẫn bảo quản<textarea name="huongDanBaoQuan" rows="3" value={productForm.huongDanBaoQuan} onChange={handleProductFormChange} /></label>
              <label className="product-form-full">Đặc trưng văn hóa<textarea name="dacTrungVanHoa" rows="3" value={productForm.dacTrungVanHoa} onChange={handleProductFormChange} /></label>
              <label className="product-form-full">Lịch sử sản phẩm<textarea name="lichSuSanPham" rows="3" value={productForm.lichSuSanPham} onChange={handleProductFormChange} /></label>
              <label className="product-form-full">Mô tả văn hóa tỉnh<textarea name="moTaVanHoaTinh" rows="3" value={productForm.moTaVanHoaTinh} onChange={handleProductFormChange} /></label>
            </div>
            <div className="product-modal-actions"><button type="button" disabled={isSaving} onClick={() => setProductFormMode(null)}>Đóng</button><button className="button" type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu'}</button></div>
          </form>
        </div>
      ) : null}

      {variantProduct ? (
        <div className="product-modal-backdrop" role="presentation">
          <section className="product-modal variant-modal">
            <div className="variant-modal-top">
              <div className="product-modal-heading"><span>Biến thể sản phẩm</span><h2>{variantProduct.name}</h2><p>Quản lý biến thể thật từ backend.</p></div>
              <button className="button" type="button" onClick={openAddVariant}>Thêm biến thể</button>
            </div>
            {isDetailLoading ? <p className="product-management-message">Đang tải biến thể...</p> : null}
            <div className="variant-table">
              <div className="variant-table-head"><span>Mã biến thể</span><span>Trọng lượng</span><span>Quy cách</span><span>Giá bán</span><span>Tồn kho</span><span>Hạn sử dụng</span><span>Trạng thái</span><span>Thao tác</span></div>
              {variants.map((variant) => (
                <article className="variant-table-row" key={variant.id}>
                  <strong>{variant.id}</strong><span>{variant.weight || 'Đang cập nhật'}</span><span>{variant.packaging || variant.label}</span><span>{formatCurrency(variant.price)}</span><span>{variant.stock}</span><span>{formatDate(variant.expiryDate)}</span><span className={`product-status product-status-${variant.status ? 'active' : 'hidden'}`}>{variant.status ? 'Đang bán' : 'Tạm ẩn'}</span>
                  <div className="product-actions"><button type="button" disabled={isSaving} onClick={() => openEditVariant(variant)}>Sửa</button><button type="button" disabled={isSaving} onClick={() => handleToggleVariant(variant)}>{variant.status ? 'Tạm ẩn' : 'Hiện lại'}</button></div>
                </article>
              ))}
              {variants.length === 0 ? <p className="variant-empty">Sản phẩm này chưa có biến thể.</p> : null}
            </div>
            {variantFormMode ? (
              <form className="variant-form" onSubmit={saveVariant}>
                <h3>{variantFormMode === 'add' ? 'Thêm biến thể' : 'Sửa biến thể'}</h3>
                <div className="product-form-grid">
                  <label>Trọng lượng<input name="trongLuong" value={variantForm.trongLuong} onChange={handleVariantFormChange} /></label>
                  <label>Quy cách đóng gói<input name="quyCachDongGoi" value={variantForm.quyCachDongGoi} onChange={handleVariantFormChange} /></label>
                  <label>Giá bán<input name="giaBan" type="number" min="0" value={variantForm.giaBan} onChange={handleVariantFormChange} /></label>
                  <label>Số lượng tồn<input name="soLuongTon" type="number" min="0" value={variantForm.soLuongTon} onChange={handleVariantFormChange} /></label>
                  <label>Hạn sử dụng<input name="hanSuDung" type="date" value={variantForm.hanSuDung} onChange={handleVariantFormChange} /></label>
                  <label>Hình ảnh<input name="hinhAnh" value={variantForm.hinhAnh} onChange={handleVariantFormChange} /></label>
                  <label>Trạng thái<select name="trangThai" value={variantForm.trangThai} onChange={handleVariantFormChange}><option value="true">Đang bán</option><option value="false">Tạm ẩn</option></select></label>
                </div>
                <div className="product-modal-actions"><button type="button" disabled={isSaving} onClick={() => setVariantFormMode(null)}>Hủy</button><button className="button" type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu biến thể'}</button></div>
              </form>
            ) : null}
            <div className="product-modal-actions"><button type="button" onClick={() => setVariantProduct(null)}>Đóng</button></div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ProductManagementPage
