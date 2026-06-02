import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockCategories } from '../../data/mockCategories'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getChildCategories,
  mapCategoryFromApi,
  toggleCategory,
  updateCategory,
} from '../../services/categoryService'
import './CategoryManagementPage.css'

const fallbackCategories = mockCategories.map(mapCategoryFromApi)

const statusLabels = {
  visible: 'Đang hiển thị',
  hidden: 'Tạm ẩn',
}

const typeLabels = {
  root: 'Danh mục lớn',
  child: 'Danh mục con',
}

const emptyCategoryForm = {
  tenDanhMuc: '',
  maDanhMucCha: '',
  moTa: '',
  thuTuHienThi: '',
  trangThai: 'true',
}

const getStatusKey = (category) => (category.status ? 'visible' : 'hidden')
const getTypeKey = (category) => (category.parentId ? 'child' : 'root')

function CategoryManagementPage() {
  const [categories, setCategories] = useState(fallbackCategories)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailCategory, setDetailCategory] = useState(null)
  const [detailChildren, setDetailChildren] = useState([])
  const [formMode, setFormMode] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadCategories = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiCategories = await getCategories()
      setCategories(apiCategories.length > 0 ? apiCategories : fallbackCategories)
      setHasApiError(false)
    } catch {
      setCategories(fallbackCategories)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const parentNameById = useMemo(() => {
    return categories.reduce((result, category) => {
      result[category.id] = category.name
      return result
    }, {})
  }, [categories])

  const treeRows = useMemo(() => {
    const childrenByParent = categories.reduce((result, category) => {
      if (category.parentId) {
        result[category.parentId] = [...(result[category.parentId] || []), category]
      }
      return result
    }, {})
    const roots = categories.filter((category) => !category.parentId)
    const orphanChildren = categories.filter((category) => category.parentId && !parentNameById[category.parentId])
    const rows = []

    roots
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach((root) => {
        rows.push({ ...root, level: 0 })
        ;(childrenByParent[root.id] || [])
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .forEach((child) => rows.push({ ...child, level: 1 }))
      })

    orphanChildren
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach((child) => rows.push({ ...child, level: 1 }))

    return rows
  }, [categories, parentNameById])

  const stats = useMemo(() => {
    return categories.reduce(
      (result, category) => {
        const typeKey = getTypeKey(category)
        const statusKey = getStatusKey(category)

        result.total += 1
        result.productCount += Number(category.productCount || 0)
        result[typeKey] += 1
        result[statusKey] += 1
        return result
      },
      { total: 0, root: 0, child: 0, visible: 0, hidden: 0, productCount: 0 },
    )
  }, [categories])

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return treeRows.filter((category) => {
      const matchesSearch =
        !normalizedSearch ||
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.description.toLowerCase().includes(normalizedSearch) ||
        category.id.toLowerCase().includes(normalizedSearch)
      const matchesType = typeFilter === 'all' || getTypeKey(category) === typeFilter
      const matchesStatus = statusFilter === 'all' || getStatusKey(category) === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchTerm, statusFilter, treeRows, typeFilter])

  const openDetailModal = async (category) => {
    setActionError('')
    setActionMessage('')
    setDetailCategory(category)
    setDetailChildren([])
    setIsDetailLoading(true)

    try {
      const apiCategory = await getCategoryById(category.id)
      setDetailCategory(apiCategory)

      if (!apiCategory.parentId) {
        const apiChildren = await getChildCategories(category.id)
        setDetailChildren(apiChildren)
      }
    } catch (error) {
      setDetailCategory(category)
      setDetailChildren(categories.filter((item) => item.parentId === category.id))
      setActionError(error?.message || 'Không thể tải chi tiết danh mục từ backend.')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const openAddModal = () => {
    setActionError('')
    setActionMessage('')
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
    setFormMode('add')
  }

  const openEditModal = (category) => {
    setActionError('')
    setActionMessage('')
    setEditingCategory(category)
    setCategoryForm({
      tenDanhMuc: category.name || '',
      maDanhMucCha: category.parentId || '',
      moTa: category.description || '',
      thuTuHienThi: category.displayOrder === 0 ? '0' : String(category.displayOrder || ''),
      trangThai: category.status ? 'true' : 'false',
    })
    setFormMode('edit')
  }

  const closeFormModal = () => {
    setFormMode(null)
    setEditingCategory(null)
    setCategoryForm(emptyCategoryForm)
  }

  const handleCategoryFormChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((current) => ({ ...current, [name]: value }))
  }

  const validateCategoryForm = () => {
    if (!categoryForm.tenDanhMuc.trim()) {
      return 'Tên danh mục không được rỗng.'
    }

    if (
      formMode === 'edit' &&
      editingCategory &&
      categoryForm.maDanhMucCha &&
      String(categoryForm.maDanhMucCha) === String(editingCategory.id)
    ) {
      return 'Danh mục cha không được là chính nó.'
    }

    if (categoryForm.thuTuHienThi !== '' && Number.isNaN(Number(categoryForm.thuTuHienThi))) {
      return 'Thứ tự hiển thị phải là số hoặc để trống.'
    }

    return ''
  }

  const buildCategoryPayload = () => ({
    tenDanhMuc: categoryForm.tenDanhMuc.trim(),
    maDanhMucCha: categoryForm.maDanhMucCha ? Number(categoryForm.maDanhMucCha) : null,
    moTa: categoryForm.moTa.trim(),
    thuTuHienThi: categoryForm.thuTuHienThi === '' ? null : Number(categoryForm.thuTuHienThi),
    trangThai: categoryForm.trangThai === 'true',
  })

  const saveCategory = async (event) => {
    event.preventDefault()
    const validationMessage = validateCategoryForm()

    if (validationMessage) {
      setActionError(validationMessage)
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      if (formMode === 'edit') {
        await updateCategory(editingCategory.id, buildCategoryPayload())
        setActionMessage('Đã cập nhật danh mục.')
      } else {
        await createCategory(buildCategoryPayload())
        setActionMessage('Đã thêm danh mục.')
      }

      closeFormModal()
      await loadCategories()
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleCategory = async (category) => {
    setIsSaving(true)
    setActionError('')

    try {
      await toggleCategory(category.id)
      setActionMessage(category.status ? 'Đã ẩn danh mục.' : 'Đã hiện danh mục.')
      await loadCategories()
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm danh mục này?')) {
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      await deleteCategory(category.id)
      setActionMessage('Đã xóa mềm danh mục.')
      await loadCategories()
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="category-management-page">
      <section className="category-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý danh mục</h1>
          <p>Theo dõi danh mục thật từ backend, cấu trúc cha/con và trạng thái hiển thị.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm danh mục
        </button>
      </section>

      <section className="category-stat-grid">
        <article><span>Tổng danh mục</span><strong>{stats.total}</strong></article>
        <article><span>Danh mục lớn</span><strong>{stats.root}</strong></article>
        <article><span>Danh mục con</span><strong>{stats.child}</strong></article>
        <article><span>Đang hiển thị</span><strong>{stats.visible}</strong></article>
        <article><span>Tạm ẩn</span><strong>{stats.hidden}</strong></article>
        <article><span>Tổng sản phẩm</span><strong>{stats.productCount}</strong></article>
      </section>

      {isLoading ? <p className="category-message">Đang tải danh mục...</p> : null}
      {hasApiError ? <p className="category-message">Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
      {actionMessage ? <p className="category-success">{actionMessage}</p> : null}
      {actionError ? <p className="category-error">{actionError}</p> : null}

      <section className="category-management-toolbar">
        <label>
          Tìm kiếm
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Nhập tên hoặc mã danh mục" />
        </label>
        <label>
          Loại danh mục
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            <option value="root">Danh mục lớn</option>
            <option value="child">Danh mục con</option>
          </select>
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Tạm ẩn</option>
          </select>
        </label>
      </section>

      <section className="category-table-card">
        <div className="category-table-summary">
          <strong>{filteredCategories.length} danh mục</strong>
          <span>Danh mục cha hiển thị trước, danh mục con thụt vào ngay bên dưới.</span>
        </div>

        <div className="category-table">
          <div className="category-table-head">
            <span>Mã danh mục</span><span>Tên danh mục</span><span>Loại</span><span>Danh mục cha</span><span>Mô tả</span><span>Thứ tự</span><span>Sản phẩm</span><span>Nhóm nhỏ</span><span>Trạng thái</span><span>Thao tác</span>
          </div>

          {filteredCategories.map((category) => (
            <article className={`category-table-row category-level-${category.level || 0}`} key={category.id}>
              <strong>{category.id}</strong>
              <div className="category-name-cell">
                <strong>{category.name}</strong>
                <small>{category.level ? 'Danh mục con' : 'Danh mục lớn'}</small>
              </div>
              <span className={`category-type category-type-${getTypeKey(category)}`}>{typeLabels[getTypeKey(category)]}</span>
              <span>{category.parentId ? parentNameById[category.parentId] || category.parentId : 'Không có'}</span>
              <span>{category.description || 'Không có'}</span>
              <span>{category.displayOrder}</span>
              <span>{category.productCount}</span>
              <span>{category.childCount}</span>
              <span className={`category-status category-status-${getStatusKey(category)}`}>{statusLabels[getStatusKey(category)]}</span>
              <div className="category-actions">
                <button type="button" disabled={isSaving} onClick={() => openDetailModal(category)}>Xem chi tiết</button>
                <button type="button" disabled={isSaving} onClick={() => openEditModal(category)}>Sửa</button>
                <button type="button" disabled={isSaving} onClick={() => handleToggleCategory(category)}>{category.status ? 'Ẩn' : 'Hiện'}</button>
                <button type="button" disabled={isSaving} onClick={() => handleDeleteCategory(category)}>Xóa</button>
              </div>
            </article>
          ))}

          {filteredCategories.length === 0 && !isLoading ? (
            <section className="empty-products">
              <h2>Chưa có danh mục phù hợp</h2>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
            </section>
          ) : null}
        </div>
      </section>

      {detailCategory ? (
        <div className="category-modal-backdrop" role="presentation">
          <section className="category-modal category-detail-modal">
            <div className="category-modal-heading">
              <span>Chi tiết danh mục</span>
              <h2>{detailCategory.name}</h2>
            </div>

            {isDetailLoading ? <p className="category-message">Đang tải chi tiết danh mục...</p> : null}

            <div className="category-detail-grid">
              <div><span>Mã danh mục</span><strong>{detailCategory.id}</strong></div>
              <div><span>Tên danh mục</span><strong>{detailCategory.name}</strong></div>
              <div><span>Danh mục cha</span><strong>{detailCategory.parentId ? parentNameById[detailCategory.parentId] || detailCategory.parentId : 'Không có'}</strong></div>
              <div><span>Thứ tự hiển thị</span><strong>{detailCategory.displayOrder}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabels[getStatusKey(detailCategory)]}</strong></div>
              <div><span>Số sản phẩm</span><strong>{detailCategory.productCount}</strong></div>
              <div><span>Số nhóm nhỏ</span><strong>{detailCategory.childCount}</strong></div>
              <div className="category-detail-full"><span>Mô tả</span><strong>{detailCategory.description || 'Không có'}</strong></div>
            </div>

            {!detailCategory.parentId ? (
              <div className="category-children-panel">
                <h3>Danh mục con</h3>
                {detailChildren.length > 0 ? (
                  <div className="category-children-list">
                    {detailChildren.map((child) => (
                      <span key={child.id}>{child.name}<small>{child.productCount} sản phẩm</small></span>
                    ))}
                  </div>
                ) : (
                  <p>Danh mục này chưa có danh mục con.</p>
                )}
              </div>
            ) : null}

            <div className="category-modal-actions">
              <button type="button" onClick={() => setDetailCategory(null)}>Đóng</button>
            </div>
          </section>
        </div>
      ) : null}

      {formMode ? (
        <div className="category-modal-backdrop" role="presentation">
          <form className="category-modal" onSubmit={saveCategory}>
            <div className="category-modal-heading">
              <span>{formMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{formMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}</h2>
            </div>

            <div className="category-form-grid">
              <label>Tên danh mục<input name="tenDanhMuc" value={categoryForm.tenDanhMuc} onChange={handleCategoryFormChange} /></label>
              <label>
                Danh mục cha
                <select name="maDanhMucCha" value={categoryForm.maDanhMucCha} onChange={handleCategoryFormChange}>
                  <option value="">Không có</option>
                  {categories
                    .filter((category) => !editingCategory || String(category.id) !== String(editingCategory.id))
                    .map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label>Thứ tự hiển thị<input name="thuTuHienThi" value={categoryForm.thuTuHienThi} onChange={handleCategoryFormChange} /></label>
              <label>
                Trạng thái
                <select name="trangThai" value={categoryForm.trangThai} onChange={handleCategoryFormChange}>
                  <option value="true">Đang hiển thị</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </label>
              <label className="category-form-full">Mô tả<textarea name="moTa" rows="4" value={categoryForm.moTa} onChange={handleCategoryFormChange} /></label>
            </div>

            <div className="category-modal-actions">
              <button type="button" disabled={isSaving} onClick={closeFormModal}>Đóng</button>
              <button className="button" type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default CategoryManagementPage
