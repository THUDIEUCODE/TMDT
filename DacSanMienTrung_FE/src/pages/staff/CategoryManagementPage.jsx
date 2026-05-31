import { useMemo, useState } from 'react'
import './CategoryManagementPage.css'

const initialCategories = [
  {
    id: 'dac-san-hue',
    name: 'Đặc sản Huế',
    slug: 'dac-san-hue',
    parentId: '',
    description: 'Nhóm sản phẩm mang hương vị cố đô Huế.',
    productCount: 8,
    status: 'active',
  },
  {
    id: 'dac-san-da-nang',
    name: 'Đặc sản Đà Nẵng',
    slug: 'dac-san-da-nang',
    parentId: '',
    description: 'Các món quà đặc trưng của thành phố biển Đà Nẵng.',
    productCount: 6,
    status: 'active',
  },
  {
    id: 'dac-san-quang-nam',
    name: 'Đặc sản Quảng Nam',
    slug: 'dac-san-quang-nam',
    parentId: '',
    description: 'Bánh khô mè, mì Quảng khô và sản vật xứ Quảng.',
    productCount: 7,
    status: 'active',
  },
  {
    id: 'dac-san-bien',
    name: 'Đặc sản biển',
    slug: 'dac-san-bien',
    parentId: '',
    description: 'Hải sản khô, mực rim, cá khô và món ngon vùng duyên hải.',
    productCount: 5,
    status: 'active',
  },
  {
    id: 'do-uong-truyen-thong',
    name: 'Đồ uống truyền thống',
    slug: 'do-uong-truyen-thong',
    parentId: '',
    description: 'Trà, nước thảo mộc và thức uống địa phương.',
    productCount: 4,
    status: 'hidden',
  },
  {
    id: 'qua-bieu-dac-san',
    name: 'Quà biếu đặc sản',
    slug: 'qua-bieu-dac-san',
    parentId: '',
    description: 'Hộp quà, combo biếu tặng cho gia đình và đối tác.',
    productCount: 9,
    status: 'active',
  },
  {
    id: 'banh-keo-hue',
    name: 'Bánh kẹo Huế',
    slug: 'banh-keo-hue',
    parentId: 'dac-san-hue',
    description: 'Các loại bánh kẹo truyền thống của Huế.',
    productCount: 3,
    status: 'active',
  },
]

const emptyForm = {
  name: '',
  slug: '',
  parentId: '',
  description: '',
  status: 'active',
}

const statusLabels = {
  active: 'Đang hiển thị',
  hidden: 'Đang ẩn',
}

const createSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function CategoryManagementPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const parentNameById = useMemo(() => {
    return categories.reduce((result, category) => {
      result[category.id] = category.name
      return result
    }, {})
  }, [categories])

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return categories
    }

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch),
    )
  }, [categories, searchTerm])

  const openAddModal = () => {
    setModalMode('add')
    setEditingCategoryId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (category) => {
    setModalMode('edit')
    setEditingCategoryId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      description: category.description,
      status: category.status,
    })
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingCategoryId(null)
    setFormData(emptyForm)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
      slug: name === 'name' && !current.slug ? createSlug(value) : name === 'slug' ? value : current.slug,
    }))
  }

  const handleSaveCategory = (event) => {
    event.preventDefault()

    const nextCategoryData = {
      name: formData.name.trim(),
      slug: createSlug(formData.slug || formData.name),
      parentId: formData.parentId,
      description: formData.description.trim(),
      status: formData.status,
    }

    if (modalMode === 'edit') {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === editingCategoryId ? { ...category, ...nextCategoryData } : category,
        ),
      )
    } else {
      const id = `${nextCategoryData.slug}-${Date.now()}`
      setCategories((currentCategories) => [
        {
          ...nextCategoryData,
          id,
          productCount: 0,
        },
        ...currentCategories,
      ])
    }

    closeModal()
  }

  const toggleCategoryStatus = (categoryId) => {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? { ...category, status: category.status === 'hidden' ? 'active' : 'hidden' }
          : category,
      ),
    )
  }

  return (
    <div className="category-management-page">
      <section className="category-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý danh mục</h1>
          <p>Tạo, chỉnh sửa và kiểm soát trạng thái hiển thị của danh mục sản phẩm.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm danh mục
        </button>
      </section>

      <section className="category-management-toolbar">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập tên danh mục hoặc slug"
          />
        </label>
      </section>

      <section className="category-table-card">
        <div className="category-table-summary">
          <strong>{filteredCategories.length} danh mục</strong>
          <span>Dữ liệu dùng state nội bộ, không kết nối backend.</span>
        </div>

        <div className="category-table">
          <div className="category-table-head">
            <span>Tên danh mục</span>
            <span>Slug</span>
            <span>Danh mục cha</span>
            <span>Số sản phẩm</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredCategories.map((category) => (
            <article className="category-table-row" key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </div>
              <span>{category.slug}</span>
              <span>{category.parentId ? parentNameById[category.parentId] : 'Không có'}</span>
              <span>{category.productCount}</span>
              <span className={`category-status category-status-${category.status}`}>
                {statusLabels[category.status]}
              </span>
              <div className="category-actions">
                <button type="button" onClick={() => openEditModal(category)}>
                  Sửa
                </button>
                <button type="button" onClick={() => toggleCategoryStatus(category.id)}>
                  {category.status === 'hidden' ? 'Hiện' : 'Ẩn'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {modalMode ? (
        <div className="category-modal-backdrop" role="presentation">
          <form className="category-modal" onSubmit={handleSaveCategory}>
            <div className="category-modal-heading">
              <span>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{modalMode === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}</h2>
            </div>

            <div className="category-form-grid">
              <label>
                Tên danh mục
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Ví dụ: Đặc sản Huế"
                />
              </label>

              <label>
                Slug
                <input
                  required
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  placeholder="dac-san-hue"
                />
              </label>

              <label>
                Danh mục cha
                <select name="parentId" value={formData.parentId} onChange={handleFormChange}>
                  <option value="">Không có</option>
                  {categories
                    .filter((category) => category.id !== editingCategoryId)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Trạng thái
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="category-form-full">
                Mô tả
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Nhập mô tả ngắn cho danh mục"
                />
              </label>
            </div>

            <div className="category-modal-actions">
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
    </div>
  )
}

export default CategoryManagementPage
