import { useMemo, useState } from 'react'
import { blogCategoryLabels, blogStatusLabels, mockBlogs } from '../../data/mockBlogs'
import { mockProducts } from '../../data/mockProducts'
import './BlogManagementPage.css'

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

const productOptions = mockProducts.map((product) => ({
  id: product.id,
  name: productNames[product.id] || product.name,
}))

const emptyForm = {
  title: '',
  slug: '',
  category: 'foodCulture',
  thumbnail: '',
  summary: '',
  content: '',
  author: '',
  relatedProductIds: [],
  status: 'draft',
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

const today = () => new Date().toISOString().slice(0, 10)

function BlogManagementPage() {
  const [blogs, setBlogs] = useState(mockBlogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingBlogId, setEditingBlogId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [detailBlog, setDetailBlog] = useState(null)

  const stats = useMemo(() => {
    return blogs.reduce(
      (result, blog) => {
        result.total += 1
        result[blog.status] += 1
        result.views += blog.views
        return result
      },
      { total: 0, published: 0, draft: 0, hidden: 0, views: 0 },
    )
  }, [blogs])

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return blogs.filter((blog) => {
      const matchesSearch =
        !normalizedSearch || blog.title.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || blog.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [blogs, categoryFilter, searchTerm, statusFilter])

  const openAddModal = () => {
    setModalMode('add')
    setEditingBlogId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (blog) => {
    setModalMode('edit')
    setEditingBlogId(blog.id)
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      thumbnail: blog.thumbnail,
      summary: blog.summary,
      content: blog.content,
      author: blog.author,
      relatedProductIds: blog.relatedProductIds,
      status: blog.status,
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setEditingBlogId(null)
    setFormData(emptyForm)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
      slug: name === 'title' && !current.slug ? createSlug(value) : name === 'slug' ? value : current.slug,
    }))
  }

  const toggleRelatedProduct = (productId) => {
    setFormData((current) => ({
      ...current,
      relatedProductIds: current.relatedProductIds.includes(productId)
        ? current.relatedProductIds.filter((id) => id !== productId)
        : [...current.relatedProductIds, productId],
    }))
  }

  const saveBlog = (event) => {
    event.preventDefault()
    const slug = createSlug(formData.slug || formData.title)
    const nextBlogData = {
      title: formData.title.trim(),
      slug,
      category: formData.category,
      thumbnail: formData.thumbnail.trim() || formData.title.slice(0, 3).toUpperCase(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      author: formData.author.trim(),
      relatedProductIds: formData.relatedProductIds,
      status: formData.status,
      description: formData.summary.trim(),
      image: formData.thumbnail.trim() || formData.title.slice(0, 3).toUpperCase(),
      topic: blogCategoryLabels[formData.category],
      publishedDate: today(),
    }

    if (modalMode === 'edit') {
      setBlogs((currentBlogs) =>
        currentBlogs.map((blog) =>
          blog.id === editingBlogId ? { ...blog, ...nextBlogData } : blog,
        ),
      )
    } else {
      setBlogs((currentBlogs) => [
        {
          ...nextBlogData,
          id: `${slug}-${Date.now()}`,
          createdAt: today(),
          views: 0,
          province: 'Miền Trung',
        },
        ...currentBlogs,
      ])
    }

    closeFormModal()
  }

  const publishBlog = (blogId) => {
    setBlogs((currentBlogs) =>
      currentBlogs.map((blog) => (blog.id === blogId ? { ...blog, status: 'published' } : blog)),
    )
  }

  const hideBlog = (blogId) => {
    setBlogs((currentBlogs) =>
      currentBlogs.map((blog) => (blog.id === blogId ? { ...blog, status: 'hidden' } : blog)),
    )
  }

  const deleteBlog = (blogId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa bài viết này?')
    if (!confirmed) {
      return
    }
    setBlogs((currentBlogs) => currentBlogs.filter((blog) => blog.id !== blogId))
  }

  const getRelatedProducts = (blog) =>
    blog.relatedProductIds
      .map((productId) => productOptions.find((product) => product.id === productId))
      .filter(Boolean)

  return (
    <div className="blog-management-page">
      <section className="blog-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý Blog</h1>
          <p>Quản lý nội dung văn hóa ẩm thực, câu chuyện đặc sản và gợi ý quà biếu.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm bài viết
        </button>
      </section>

      <section className="blog-stat-grid">
        <article>
          <span>Tổng bài viết</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Đã xuất bản</span>
          <strong>{stats.published}</strong>
        </article>
        <article>
          <span>Bản nháp</span>
          <strong>{stats.draft}</strong>
        </article>
        <article>
          <span>Đã ẩn</span>
          <strong>{stats.hidden}</strong>
        </article>
        <article>
          <span>Tổng lượt xem</span>
          <strong>{stats.views.toLocaleString('vi-VN')}</strong>
        </article>
      </section>

      <section className="blog-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập tiêu đề bài viết"
          />
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(blogStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Chuyên mục
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(blogCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="blog-table-card">
        <div className="blog-table-summary">
          <strong>{filteredBlogs.length} bài viết</strong>
          <span>Dữ liệu mock, thao tác cập nhật bằng state nội bộ.</span>
        </div>

        <div className="blog-management-table">
          <div className="blog-table-head">
            <span>Ảnh</span>
            <span>Tiêu đề</span>
            <span>Chuyên mục</span>
            <span>Tác giả</span>
            <span>Ngày tạo</span>
            <span>Lượt xem</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredBlogs.map((blog) => (
            <article className="blog-table-row" key={blog.id}>
              <div className="blog-thumb">{blog.thumbnail}</div>
              <div className="blog-title-cell">
                <strong>{blog.title}</strong>
                <span>{blog.slug}</span>
              </div>
              <span>{blogCategoryLabels[blog.category]}</span>
              <span>{blog.author}</span>
              <span>{blog.createdAt}</span>
              <span>{blog.views.toLocaleString('vi-VN')}</span>
              <span className={`blog-status blog-status-${blog.status}`}>
                {blogStatusLabels[blog.status]}
              </span>
              <div className="blog-actions">
                <button type="button" onClick={() => setDetailBlog(blog)}>
                  Xem chi tiết
                </button>
                <button type="button" onClick={() => openEditModal(blog)}>
                  Sửa
                </button>
                {blog.status !== 'published' ? (
                  <button type="button" onClick={() => publishBlog(blog.id)}>
                    Xuất bản
                  </button>
                ) : null}
                {blog.status !== 'hidden' ? (
                  <button type="button" onClick={() => hideBlog(blog.id)}>
                    Ẩn
                  </button>
                ) : null}
                <button className="danger" type="button" onClick={() => deleteBlog(blog.id)}>
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {modalMode ? (
        <div className="blog-modal-backdrop" role="presentation">
          <form className="blog-modal blog-form-modal" onSubmit={saveBlog}>
            <div className="blog-modal-heading">
              <span>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{modalMode === 'add' ? 'Thêm bài viết' : 'Sửa bài viết'}</h2>
            </div>

            <div className="blog-form-grid">
              <label>
                Tiêu đề bài viết
                <input required name="title" value={formData.title} onChange={handleFormChange} />
              </label>
              <label>
                Slug
                <input required name="slug" value={formData.slug} onChange={handleFormChange} />
              </label>
              <label>
                Chuyên mục
                <select name="category" value={formData.category} onChange={handleFormChange}>
                  {Object.entries(blogCategoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ảnh đại diện URL hoặc text
                <input name="thumbnail" value={formData.thumbnail} onChange={handleFormChange} />
              </label>
              <label>
                Tác giả
                <input required name="author" value={formData.author} onChange={handleFormChange} />
              </label>
              <label>
                Trạng thái
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  {Object.entries(blogStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="blog-form-full">
                Mô tả ngắn
                <textarea
                  name="summary"
                  rows="3"
                  value={formData.summary}
                  onChange={handleFormChange}
                />
              </label>
              <label className="blog-form-full">
                Nội dung bài viết
                <textarea
                  className="blog-content-input"
                  name="content"
                  rows="8"
                  value={formData.content}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            <div className="related-product-picker">
              <h3>Sản phẩm liên quan</h3>
              <div>
                {productOptions.map((product) => (
                  <label key={product.id}>
                    <input
                      type="checkbox"
                      checked={formData.relatedProductIds.includes(product.id)}
                      onChange={() => toggleRelatedProduct(product.id)}
                    />
                    <span>{product.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="blog-modal-actions">
              <button type="button" onClick={closeFormModal}>
                Hủy
              </button>
              <button className="button" type="submit">
                Lưu
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detailBlog ? (
        <div className="blog-modal-backdrop" role="presentation">
          <section className="blog-modal blog-detail-modal">
            <div className="blog-modal-heading">
              <span>{blogStatusLabels[detailBlog.status]}</span>
              <h2>{detailBlog.title}</h2>
            </div>
            <div className="blog-detail-meta">
              <span>{blogCategoryLabels[detailBlog.category]}</span>
              <span>{detailBlog.author}</span>
              <span>{detailBlog.createdAt}</span>
              <span>{detailBlog.views.toLocaleString('vi-VN')} lượt xem</span>
            </div>
            <p className="blog-detail-summary">{detailBlog.summary}</p>
            <p className="blog-detail-content">{detailBlog.content}</p>
            <div className="blog-related-products">
              <h3>Sản phẩm liên quan</h3>
              {getRelatedProducts(detailBlog).length > 0 ? (
                <div>
                  {getRelatedProducts(detailBlog).map((product) => (
                    <span key={product.id}>{product.name}</span>
                  ))}
                </div>
              ) : (
                <p>Chưa gắn sản phẩm liên quan.</p>
              )}
            </div>
            <div className="blog-modal-actions">
              <button type="button" onClick={() => setDetailBlog(null)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default BlogManagementPage
