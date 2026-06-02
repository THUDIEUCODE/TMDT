import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockProducts } from '../../data/mockProducts'
import {
  getInventory,
  getInventoryByVariantId,
  getInventorySummary,
  importStock,
  inventoryStatusLabels,
  normalizeInventoryStatus,
  normalizeVariantStatus,
  updateStock,
  variantStatusLabels,
} from '../../services/inventoryService'
import { mapProductFromApi } from '../../services/productService'
import './InventoryPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatDate = (value) => {
  if (!value) {
    return 'Không có'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const createInventoryRows = (products) =>
  products.flatMap((product) =>
    (product.variants || []).map((variant) => {
      const stock = Number(variant.stock || 0)
      const inventoryStatus = normalizeInventoryStatus(stock)
      const variantStatus = normalizeVariantStatus(variant.status)

      return {
        id: `${product.id}-${variant.id}`,
        productId: String(product.id),
        productName: product.name,
        categoryId: String(product.categoryId || ''),
        categoryName: product.categoryName || product.category || 'Đang cập nhật',
        province: product.province || '',
        region: product.region || '',
        productImage: product.imageUrl || product.image || '',
        variantImage: variant.image || '',
        image: variant.image || product.imageUrl || product.image,
        variantId: String(variant.variantId || variant.id),
        weight: variant.weight || '',
        packaging: variant.packaging || variant.label || '',
        price: Number(variant.price || 0),
        stock,
        expiryDate: variant.expiryDate || '',
        variantStatus,
        inventoryStatus,
        inventoryStatusLabel: inventoryStatusLabels[inventoryStatus],
      }
    }),
  )

const getSummaryFromItems = (inventoryItems) =>
  inventoryItems.reduce(
    (result, item) => {
      const inventoryStatus = item.inventoryStatus || normalizeInventoryStatus(item.stock)

      result.totalVariants += 1
      result.totalStock += Number(item.stock || 0)

      if (inventoryStatus === 'hetHang') {
        result.outOfStock += 1
      }

      if (inventoryStatus === 'ratThap') {
        result.veryLow += 1
      }

      if (inventoryStatus === 'canNhapThem') {
        result.needImport += 1
      }

      if (inventoryStatus === 'conHang') {
        result.inStock += 1
      }

      return result
    },
    { totalVariants: 0, totalStock: 0, outOfStock: 0, veryLow: 0, needImport: 0, inStock: 0 },
  )

const fallbackInventory = createInventoryRows(mockProducts.map(mapProductFromApi))
const fallbackSummary = getSummaryFromItems(fallbackInventory)

function InventoryPage() {
  const [items, setItems] = useState(fallbackInventory)
  const [summary, setSummary] = useState(fallbackSummary)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [provinceFilter, setProvinceFilter] = useState('all')
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('all')
  const [variantStatusFilter, setVariantStatusFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [updateForm, setUpdateForm] = useState({ newStock: '', note: '' })
  const [importForm, setImportForm] = useState({ quantity: '', note: '' })

  const loadInventory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const [apiInventory, apiSummary] = await Promise.all([
        getInventory(),
        getInventorySummary(),
      ])
      const inventoryRows = apiInventory.length > 0 ? apiInventory : fallbackInventory

      setItems(inventoryRows)
      setSummary(apiInventory.length > 0 ? apiSummary : fallbackSummary)
      setHasApiError(false)
    } catch {
      setItems(fallbackInventory)
      setSummary(fallbackSummary)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadInventory()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [loadInventory])

  const enrichedItems = useMemo(
    () =>
      items.map((item) => {
        const inventoryStatus = item.inventoryStatus || normalizeInventoryStatus(item.stock)
        const variantStatus = item.variantStatus || normalizeVariantStatus(item.status)

        return {
          ...item,
          inventoryStatus,
          inventoryStatusLabel: item.inventoryStatusLabel || inventoryStatusLabels[inventoryStatus],
          variantStatus,
        }
      }),
    [items],
  )

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map()
    enrichedItems.forEach((item) => {
      if (item.categoryId) {
        categoryMap.set(String(item.categoryId), item.categoryName)
      }
    })
    return Array.from(categoryMap.entries()).map(([value, label]) => ({ value, label }))
  }, [enrichedItems])

  const provinceOptions = useMemo(
    () => [...new Set(enrichedItems.map((item) => item.province).filter(Boolean))].sort(),
    [enrichedItems],
  )

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return enrichedItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.productName.toLowerCase().includes(normalizedSearch) ||
        item.variantId.toLowerCase().includes(normalizedSearch) ||
        item.weight.toLowerCase().includes(normalizedSearch) ||
        item.packaging.toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === 'all' || String(item.categoryId) === String(categoryFilter)
      const matchesProvince = provinceFilter === 'all' || item.province === provinceFilter
      const matchesInventoryStatus =
        inventoryStatusFilter === 'all' || item.inventoryStatus === inventoryStatusFilter
      const matchesVariantStatus = variantStatusFilter === 'all' || item.variantStatus === variantStatusFilter

      return (
        matchesSearch &&
        matchesCategory &&
        matchesProvince &&
        matchesInventoryStatus &&
        matchesVariantStatus
      )
    })
  }, [categoryFilter, enrichedItems, inventoryStatusFilter, provinceFilter, searchTerm, variantStatusFilter])

  const openDetailModal = async (item) => {
    setSelectedItem(item)
    setModalType('detail')
    setActionError('')
    setActionMessage('')

    try {
      const apiItem = await getInventoryByVariantId(item.variantId)
      setSelectedItem(apiItem)
    } catch {
      setSelectedItem(item)
    }
  }

  const openUpdateModal = (item) => {
    setSelectedItem(item)
    setModalType('update')
    setUpdateForm({ newStock: String(item.stock), note: '' })
    setActionError('')
    setActionMessage('')
  }

  const openImportModal = (item) => {
    setSelectedItem(item)
    setModalType('import')
    setImportForm({ quantity: '', note: '' })
    setActionError('')
    setActionMessage('')
  }

  const closeModal = () => {
    setSelectedItem(null)
    setModalType(null)
    setUpdateForm({ newStock: '', note: '' })
    setImportForm({ quantity: '', note: '' })
  }

  const submitUpdateStock = async (event) => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')

    if (updateForm.newStock === '') {
      setActionError('Vui lòng nhập số lượng tồn mới.')
      return
    }

    const nextStock = Number(updateForm.newStock)

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setActionError('Số lượng tồn mới phải lớn hơn hoặc bằng 0.')
      return
    }

    try {
      setIsSubmitting(true)
      await updateStock(selectedItem.variantId, {
        soLuongTonMoi: nextStock,
        ghiChu: updateForm.note.trim(),
      })
      closeModal()
      setActionMessage('Đã cập nhật tồn kho.')
      await loadInventory({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể cập nhật tồn kho.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitImportStock = async (event) => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')

    if (importForm.quantity === '') {
      setActionError('Vui lòng nhập số lượng nhập thêm.')
      return
    }

    const quantity = Number(importForm.quantity)

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setActionError('Số lượng nhập thêm phải lớn hơn 0.')
      return
    }

    try {
      setIsSubmitting(true)
      await importStock(selectedItem.variantId, {
        soLuongNhapThem: quantity,
        ghiChu: importForm.note.trim(),
      })
      closeModal()
      setActionMessage('Đã nhập thêm hàng.')
      await loadInventory({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể nhập thêm hàng.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="inventory-page">
      <section className="inventory-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý tồn kho</h1>
          <p>Theo dõi và cập nhật tồn kho thật theo từng biến thể sản phẩm từ backend.</p>
        </div>
      </section>

      <section className="inventory-stat-grid">
        <article>
          <span>Tổng số biến thể</span>
          <strong>{summary.totalVariants}</strong>
        </article>
        <article>
          <span>Tổng tồn kho</span>
          <strong>{summary.totalStock}</strong>
        </article>
        <article>
          <span>Hết hàng</span>
          <strong>{summary.outOfStock}</strong>
        </article>
        <article>
          <span>Rất thấp</span>
          <strong>{summary.veryLow}</strong>
        </article>
        <article>
          <span>Cần nhập thêm</span>
          <strong>{summary.needImport}</strong>
        </article>
        <article>
          <span>Còn hàng</span>
          <strong>{summary.inStock}</strong>
        </article>
      </section>

      {isLoading ? <p className="inventory-message">Đang tải dữ liệu tồn kho...</p> : null}
      {hasApiError ? (
        <p className="inventory-message">Không kết nối được backend, đang dùng dữ liệu mẫu.</p>
      ) : null}
      {actionMessage ? <p className="inventory-success">{actionMessage}</p> : null}
      {actionError ? <p className="inventory-error">{actionError}</p> : null}

      <section className="inventory-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tên sản phẩm, mã biến thể, trọng lượng hoặc quy cách"
          />
        </label>

        <label>
          Danh mục
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tỉnh/thành
          <select value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)}>
            <option value="all">Tất cả tỉnh/thành</option>
            {provinceOptions.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trạng thái tồn kho
          <select value={inventoryStatusFilter} onChange={(event) => setInventoryStatusFilter(event.target.value)}>
            {Object.entries(inventoryStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trạng thái biến thể
          <select value={variantStatusFilter} onChange={(event) => setVariantStatusFilter(event.target.value)}>
            {Object.entries(variantStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="inventory-table-card">
        <div className="inventory-table-summary">
          <strong>{filteredItems.length} biến thể</strong>
          <span>Mỗi dòng là tồn kho của một biến thể sản phẩm.</span>
        </div>

        <div className="inventory-table">
          <div className="inventory-table-head">
            <span>Ảnh</span>
            <span>Tên sản phẩm</span>
            <span>Danh mục</span>
            <span>Tỉnh/thành</span>
            <span>Biến thể</span>
            <span>Giá bán</span>
            <span>Tồn kho</span>
            <span>Hạn sử dụng</span>
            <span>TT tồn kho</span>
            <span>TT biến thể</span>
            <span>Thao tác</span>
          </div>

          {filteredItems.map((item) => (
            <article className="inventory-table-row" key={item.id}>
              <div className="inventory-image">
                {item.image && String(item.image).startsWith('http') ? (
                  <img src={item.image} alt={item.productName} />
                ) : (
                  item.image || 'SP'
                )}
              </div>
              <strong>{item.productName}</strong>
              <span>{item.categoryName}</span>
              <span>{item.province || 'Đang cập nhật'}</span>
              <span>
                {item.weight || 'Không có'} / {item.packaging || 'Không có'}
              </span>
              <span>{formatCurrency(item.price)}</span>
              <b>{item.stock}</b>
              <span>{formatDate(item.expiryDate)}</span>
              <span className={`inventory-status inventory-status-${item.inventoryStatus}`}>
                {item.inventoryStatusLabel}
              </span>
              <span className={`variant-status variant-status-${item.variantStatus}`}>
                {variantStatusLabels[item.variantStatus]}
              </span>
              <div className="inventory-actions">
                <button type="button" onClick={() => openDetailModal(item)}>
                  Xem chi tiết
                </button>
                <button type="button" onClick={() => openUpdateModal(item)}>
                  Cập nhật tồn
                </button>
                <button type="button" onClick={() => openImportModal(item)}>
                  Nhập thêm
                </button>
              </div>
            </article>
          ))}

          {filteredItems.length === 0 && !isLoading ? (
            <section className="empty-products">
              <h2>Chưa có tồn kho phù hợp</h2>
              <p>Thử thay đổi từ khóa hoặc bộ lọc.</p>
            </section>
          ) : null}
        </div>
      </section>

      {selectedItem && modalType === 'detail' ? (
        <div className="inventory-modal-backdrop" role="presentation">
          <section className="inventory-modal inventory-detail-modal">
            <div className="inventory-modal-heading">
              <span>Chi tiết tồn kho</span>
              <h2>{selectedItem.productName}</h2>
              <p>{selectedItem.variantId}</p>
            </div>
            <div className="inventory-detail-grid">
              <div>
                <span>Mã sản phẩm</span>
                <strong>{selectedItem.productId}</strong>
              </div>
              <div>
                <span>Tên sản phẩm</span>
                <strong>{selectedItem.productName}</strong>
              </div>
              <div>
                <span>Danh mục</span>
                <strong>{selectedItem.categoryName}</strong>
              </div>
              <div>
                <span>Tỉnh/thành</span>
                <strong>{selectedItem.province || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Vùng miền</span>
                <strong>{selectedItem.region || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Mã biến thể</span>
                <strong>{selectedItem.variantId}</strong>
              </div>
              <div>
                <span>Trọng lượng</span>
                <strong>{selectedItem.weight || 'Không có'}</strong>
              </div>
              <div>
                <span>Quy cách đóng gói</span>
                <strong>{selectedItem.packaging || 'Không có'}</strong>
              </div>
              <div>
                <span>Giá bán</span>
                <strong>{formatCurrency(selectedItem.price)}</strong>
              </div>
              <div>
                <span>Số lượng tồn</span>
                <strong>{selectedItem.stock}</strong>
              </div>
              <div>
                <span>Hạn sử dụng</span>
                <strong>{formatDate(selectedItem.expiryDate)}</strong>
              </div>
              <div>
                <span>Trạng thái biến thể</span>
                <strong>{variantStatusLabels[selectedItem.variantStatus]}</strong>
              </div>
              <div>
                <span>Trạng thái tồn kho</span>
                <strong>{selectedItem.inventoryStatusLabel}</strong>
              </div>
            </div>
            <div className="inventory-modal-actions">
              <button type="button" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedItem && modalType === 'update' ? (
        <div className="inventory-modal-backdrop" role="presentation">
          <form className="inventory-modal" onSubmit={submitUpdateStock}>
            <div className="inventory-modal-heading">
              <span>Cập nhật tồn kho</span>
              <h2>{selectedItem.productName}</h2>
              <p>{selectedItem.weight || selectedItem.packaging || selectedItem.variantId}</p>
            </div>
            <div className="inventory-form-grid">
              <label>
                Số lượng tồn hiện tại
                <input value={selectedItem.stock} readOnly />
              </label>
              <label>
                Số lượng tồn mới
                <input
                  min="0"
                  required
                  type="number"
                  value={updateForm.newStock}
                  onChange={(event) =>
                    setUpdateForm((current) => ({ ...current, newStock: event.target.value }))
                  }
                />
              </label>
              <label className="inventory-form-full">
                Ghi chú cập nhật
                <textarea
                  rows="4"
                  value={updateForm.note}
                  onChange={(event) =>
                    setUpdateForm((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Ví dụ: kiểm kê cuối ngày"
                />
              </label>
            </div>
            <div className="inventory-modal-actions">
              <button type="button" onClick={closeModal} disabled={isSubmitting}>
                Hủy
              </button>
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedItem && modalType === 'import' ? (
        <div className="inventory-modal-backdrop" role="presentation">
          <form className="inventory-modal" onSubmit={submitImportStock}>
            <div className="inventory-modal-heading">
              <span>Nhập thêm tồn kho</span>
              <h2>{selectedItem.productName}</h2>
              <p>{selectedItem.weight || selectedItem.packaging || selectedItem.variantId}</p>
            </div>
            <div className="inventory-form-grid">
              <label>
                Số lượng tồn hiện tại
                <input value={selectedItem.stock} readOnly />
              </label>
              <label>
                Số lượng nhập thêm
                <input
                  min="1"
                  required
                  type="number"
                  value={importForm.quantity}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                />
              </label>
              <label className="inventory-form-full">
                Ghi chú
                <textarea
                  rows="4"
                  value={importForm.note}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Ví dụ: nhập từ nhà cung cấp"
                />
              </label>
            </div>
            <div className="inventory-modal-actions">
              <button type="button" onClick={closeModal} disabled={isSubmitting}>
                Hủy
              </button>
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default InventoryPage
