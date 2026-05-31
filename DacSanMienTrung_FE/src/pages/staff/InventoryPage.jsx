import { useMemo, useState } from 'react'
import { mockProducts } from '../../data/mockProducts'
import './InventoryPage.css'

const productNames = {
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

const inventoryStatusLabels = {
  all: 'Tất cả',
  inStock: 'Còn hàng',
  low: 'Sắp hết',
  out: 'Hết hàng',
  restock: 'Cần nhập thêm',
}

const defaultWarningLevels = {
  'me-xung-hue': 20,
  'mam-ruoc-hue': 18,
  'muc-rim-me-da-nang': 15,
  'banh-kho-me-quang-nam': 18,
  'toi-ly-son': 16,
  'cha-bo-da-nang': 14,
  'nuoc-mam-nam-o': 18,
  'ca-kho-nha-trang': 15,
  'yen-sao-khanh-hoa': 10,
  'banh-trang-dai-loc': 22,
  'mi-quang-kho': 20,
  'tra-cung-dinh-hue': 16,
  'hop-qua-mien-trung': 12,
}

const formatDateInput = () => new Date().toISOString().slice(0, 10)

const createSku = (product, variant) =>
  `${product.slug}-${variant.id || variant.label}`.replace(/[^a-zA-Z0-9]+/g, '-').toUpperCase()

const getInventoryStatus = (stock, warningLevel) => {
  if (stock === 0) {
    return 'out'
  }

  if (stock <= warningLevel) {
    return 'restock'
  }

  if (stock <= warningLevel * 1.6) {
    return 'low'
  }

  return 'inStock'
}

const buildInventoryItems = () =>
  mockProducts.flatMap((product) =>
    product.variants.map((variant) => {
      const warningLevel = defaultWarningLevels[product.id] || 15

      return {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        productName: productNames[product.id] || product.name,
        categorySlug: product.categorySlug,
        categoryName: categoryLabels[product.categorySlug] || product.categorySlug,
        image: product.image,
        variantName: variant.label,
        sku: createSku(product, variant),
        stock: variant.stock,
        warningLevel,
      }
    }),
  )

function InventoryPage() {
  const [items, setItems] = useState(buildInventoryItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [updateForm, setUpdateForm] = useState({ newStock: '', note: '' })
  const [importForm, setImportForm] = useState({
    quantity: '',
    importDate: formatDateInput(),
    note: '',
  })

  const enrichedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        status: getInventoryStatus(item.stock, item.warningLevel),
      })),
    [items],
  )

  const stats = useMemo(() => {
    return enrichedItems.reduce(
      (result, item) => {
        result.total += 1
        result[item.status] += 1
        return result
      },
      { total: 0, low: 0, out: 0, restock: 0, inStock: 0 },
    )
  }, [enrichedItems])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return enrichedItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.productName.toLowerCase().includes(normalizedSearch) ||
        item.sku.toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        categoryFilter === 'all' || item.categorySlug === categoryFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [categoryFilter, enrichedItems, searchTerm, statusFilter])

  const openUpdateModal = (item) => {
    setSelectedItem(item)
    setModalType('update')
    setUpdateForm({ newStock: String(item.stock), note: '' })
  }

  const openImportModal = (item) => {
    setSelectedItem(item)
    setModalType('import')
    setImportForm({ quantity: '', importDate: formatDateInput(), note: '' })
  }

  const closeModal = () => {
    setSelectedItem(null)
    setModalType(null)
    setUpdateForm({ newStock: '', note: '' })
    setImportForm({ quantity: '', importDate: formatDateInput(), note: '' })
  }

  const saveStockUpdate = (event) => {
    event.preventDefault()
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id ? { ...item, stock: Number(updateForm.newStock) || 0 } : item,
      ),
    )
    closeModal()
  }

  const saveImportStock = (event) => {
    event.preventDefault()
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id
          ? { ...item, stock: item.stock + (Number(importForm.quantity) || 0) }
          : item,
      ),
    )
    closeModal()
  }

  return (
    <div className="inventory-page">
      <section className="inventory-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý tồn kho</h1>
          <p>Theo dõi số lượng tồn theo từng biến thể sản phẩm và cập nhật nhập kho.</p>
        </div>
      </section>

      <section className="inventory-stat-grid">
        <article>
          <span>Tổng số biến thể</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Sắp hết hàng</span>
          <strong>{stats.low}</strong>
        </article>
        <article>
          <span>Đã hết hàng</span>
          <strong>{stats.out}</strong>
        </article>
        <article>
          <span>Cần nhập thêm</span>
          <strong>{stats.restock}</strong>
        </article>
        <article>
          <span>Tồn kho ổn định</span>
          <strong>{stats.inStock}</strong>
        </article>
      </section>

      <section className="inventory-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập tên sản phẩm hoặc SKU"
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
          Trạng thái tồn kho
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {Object.entries(inventoryStatusLabels).map(([value, label]) => (
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
          <span>Dữ liệu mock, cập nhật tồn kho bằng state nội bộ.</span>
        </div>

        <div className="inventory-table">
          <div className="inventory-table-head">
            <span>Ảnh</span>
            <span>Tên sản phẩm</span>
            <span>Biến thể/quy cách</span>
            <span>SKU</span>
            <span>Danh mục</span>
            <span>Số lượng tồn</span>
            <span>Ngưỡng cảnh báo</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredItems.map((item) => (
            <article className="inventory-table-row" key={item.id}>
              <div className="inventory-image">{item.image}</div>
              <strong>{item.productName}</strong>
              <span>{item.variantName}</span>
              <span>{item.sku}</span>
              <span>{item.categoryName}</span>
              <b>{item.stock}</b>
              <span>{item.warningLevel}</span>
              <span className={`inventory-status inventory-status-${item.status}`}>
                {inventoryStatusLabels[item.status]}
              </span>
              <div className="inventory-actions">
                <button type="button" onClick={() => openUpdateModal(item)}>
                  Cập nhật tồn
                </button>
                <button type="button" onClick={() => openImportModal(item)}>
                  Nhập thêm
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedItem && modalType === 'update' ? (
        <div className="inventory-modal-backdrop" role="presentation">
          <form className="inventory-modal" onSubmit={saveStockUpdate}>
            <div className="inventory-modal-heading">
              <span>Cập nhật tồn kho</span>
              <h2>{selectedItem.productName}</h2>
              <p>{selectedItem.variantName}</p>
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

      {selectedItem && modalType === 'import' ? (
        <div className="inventory-modal-backdrop" role="presentation">
          <form className="inventory-modal" onSubmit={saveImportStock}>
            <div className="inventory-modal-heading">
              <span>Nhập thêm tồn kho</span>
              <h2>{selectedItem.productName}</h2>
              <p>{selectedItem.variantName}</p>
            </div>
            <div className="inventory-form-grid">
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
              <label>
                Ngày nhập
                <input
                  required
                  type="date"
                  value={importForm.importDate}
                  onChange={(event) =>
                    setImportForm((current) => ({ ...current, importDate: event.target.value }))
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
                  placeholder="Ví dụ: nhập từ nhà cung cấp Huế"
                />
              </label>
            </div>
            <div className="inventory-modal-actions">
              <button type="button" onClick={closeModal}>
                Hủy
              </button>
              <button className="button" type="submit">
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default InventoryPage
