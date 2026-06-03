import { useCallback, useEffect, useMemo, useState } from 'react'
import { blogCategoryLabels, blogStatusLabels, mockBlogs } from '../../data/mockBlogs'
import {
  createBlog,
  deleteBlog,
  getAllBlogsForAdmin,
  hideBlog,
  mapBlogFromApi,
  publishBlog,
  updateBlog,
} from '../../services/blogService'
import './BlogManagementPage.css'

const fallbackBlogs = mockBlogs.map(mapBlogFromApi)

const statusOptions = {
  published: blogStatusLabels.published || 'Đã xuất bản',
  draft: blogStatusLabels.draft || 'Bản nháp',
  hidden: blogStatusLabels.hidden || 'Đã ẩn',
}

const emptyForm = {
  maTacGia: '',
  tieuDe: '',
  moTa: '',
  noiDung: '',
  hinhAnh: '',
  chuDe: 'foodCulture',
  tenTinh: '',
  trangThai: 'draft',
  relatedProductIds: '',
}

const getTopicLabel = (blog) => blogCategoryLabels[blog.category] || blog.topic || blog.category || 'Đang cập nhật'

const getStatusLabel = (status) => statusOptions[status] || status || 'Đang cập nhật'

const buildBlogPayload = (formData) => ({
  maTacGia: formData.maTacGia === '' ? null : Number(formData.maTacGia),
  tieuDe: formData.tieuDe.trim(),
  moTa: formData.moTa.trim(),
  noiDung: formData.noiDung.trim(),
  hinhAnh: formData.hinhAnh.trim(),
  chuDe: formData.chuDe.trim(),
  tenTinh: formData.tenTinh.trim(),
  trangThai: formData.trangThai,
  relatedProductIds: formData.relatedProductIds
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item)),
})

function BlogManagementPage() {
  const [blogs, setBlogs] = useState(fallbackBlogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingBlogId, setEditingBlogId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [detailBlog, setDetailBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadBlogs = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true)

    try {
      const apiBlogs = await getAllBlogsForAdmin()
      setBlogs(apiBlogs)
      setHasApiError(false)
    } catch (error) {
      setBlogs(fallbackBlogs)
      setHasApiError(true)
      setActionError(error?.message || '')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadBlogs()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [loadBlogs])

  const topicOptions = useMemo(() => {
    const options = new Map(Object.entries(blogCategoryLabels))
    blogs.forEach((blog) => {
      if (blog.topic) options.set(blog.topic, blog.topic)
      if (blog.category) options.set(blog.category, blogCategoryLabels[blog.category] || blog.category)
    })
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
  }, [blogs])

  const stats = useMemo(() => {
    return blogs.reduce(
      (result, blog) => {
        result.total += 1
        result[blog.status] = Number(result[blog.status] || 0) + 1
        result.views += Number(blog.views || 0)
        return result
      },
      { total: 0, published: 0, draft: 0, hidden: 0, views: 0 },
    )
  }, [blogs])

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return blogs.filter((blog) => {
      const searchable = [blog.title, blog.description, blog.summary, blog.topic, blog.province]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || blog.status === statusFilter
      const matchesCategory =
        categoryFilter === 'all' || blog.category === categoryFilter || blog.topic === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [blogs, categoryFilter, searchTerm, statusFilter])

  const openAddModal = () => {
    setActionError('')
    setActionMessage('')
    setModalMode('add')
    setEditingBlogId(null)
    setFormData(emptyForm)
  }

  const openEditModal = (blog) => {
    setActionError('')
    setActionMessage('')
    setModalMode('edit')
    setEditingBlogId(blog.id)
    setFormData({
      maTacGia: blog.authorId === null || blog.authorId === undefined ? '' : String(blog.authorId),
      tieuDe: blog.title || '',
      moTa: blog.description || blog.summary || '',
      noiDung: blog.content || '',
      hinhAnh: blog.image || '',
      chuDe: blog.category || blog.topic || '',
      tenTinh: blog.province || '',
      trangThai: blog.status || 'draft',
      relatedProductIds: (blog.relatedProductIds || []).join(','),
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setEditingBlogId(null)
    setFormData(emptyForm)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const saveBlog = async (event) => {
    event.preventDefault()

    if (!formData.tieuDe.trim()) {
      setActionError('Tiêu đề không được rỗng.')
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      if (modalMode === 'edit') {
        await updateBlog(editingBlogId, buildBlogPayload(formData))
        setActionMessage('Đã cập nhật bài viết.')
      } else {
        await createBlog(buildBlogPayload(formData))
        setActionMessage('Đã thêm bài viết.')
      }

      closeFormModal()
      await loadBlogs({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

  const runBlogAction = async (blog, action) => {
    const confirmMessage =
      action === 'delete'
        ? 'Bạn có chắc muốn xóa mềm bài viết này?'
        : action === 'hide'
          ? 'Bạn có chắc muốn ẩn bài viết này?'
          : 'Bạn có chắc muốn xuất bản bài viết này?'

    if (!window.confirm(confirmMessage)) return

    setIsSaving(true)
    setActionError('')

    try {
      if (action === 'publish') {
        await publishBlog(blog.id)
        setActionMessage('Đã xuất bản bài viết.')
      }

      if (action === 'hide') {
        await hideBlog(blog.id)
        setActionMessage('Đã ẩn bài viết.')
      }

      if (action === 'delete') {
        await deleteBlog(blog.id)
        setActionMessage('Đã xóa mềm bài viết.')
      }

      if (detailBlog?.id === blog.id) setDetailBlog(null)
      await loadBlogs({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không kết nối được backend.')
    } finally {
      setIsSaving(false)
    }
  }

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
        <article><span>Tổng bài viết</span><strong>{stats.total}</strong></article>
        <article><span>Đã xuất bản</span><strong>{stats.published}</strong></article>
        <article><span>Bản nháp</span><strong>{stats.draft}</strong></article>
        <article><span>Đã ẩn</span><strong>{stats.hidden}</strong></article>
        <article><span>Tổng lượt xem</span><strong>{stats.views.toLocaleString('vi-VN')}</strong></article>
      </section>

      {isLoading ? <p className="product-result-summary">Đang tải bài viết...</p> : null}
      {hasApiError ? <p className="product-result-summary">Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
      {actionMessage ? <p className="form-success">{actionMessage}</p> : null}
      {actionError && !hasApiError ? <p className="form-error">{actionError}</p> : null}

      <section className="blog-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập tiêu đề, mô tả hoặc chủ đề"
          />
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(statusOptions).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Chủ đề
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="blog-table-card">
        <div className="blog-table-summary">
          <strong>{filteredBlogs.length} bài viết</strong>
          <span>Dữ liệu được tải từ backend khi kết nối thành công.</span>
        </div>

        <div className="blog-management-table">
          <div className="blog-table-head">
            <span>Ảnh</span><span>Tiêu đề</span><span>Chủ đề</span><span>Tác giả</span><span>Ngày tạo</span><span>Lượt xem</span><span>Trạng thái</span><span>Thao tác</span>
          </div>

          {filteredBlogs.map((blog) => (
            <article className="blog-table-row" key={blog.id}>
              <div className="blog-thumb">{blog.thumbnail}</div>
              <div className="blog-title-cell">
                <strong>{blog.title}</strong>
                <span>{blog.description || blog.slug}</span>
              </div>
              <span>{getTopicLabel(blog)}</span>
              <span>{blog.author || blog.authorId || 'Đang cập nhật'}</span>
              <span>{blog.createdAt || blog.publishedDate || 'Đang cập nhật'}</span>
              <span>{Number(blog.views || 0).toLocaleString('vi-VN')}</span>
              <span className={`blog-status blog-status-${blog.status}`}>{getStatusLabel(blog.status)}</span>
              <div className="blog-actions">
                <button type="button" disabled={isSaving} onClick={() => setDetailBlog(blog)}>Xem chi tiết</button>
                <button type="button" disabled={isSaving} onClick={() => openEditModal(blog)}>Sửa</button>
                {blog.status !== 'published' ? (
                  <button type="button" disabled={isSaving} onClick={() => runBlogAction(blog, 'publish')}>Xuất bản</button>
                ) : null}
                {blog.status !== 'hidden' ? (
                  <button type="button" disabled={isSaving} onClick={() => runBlogAction(blog, 'hide')}>Ẩn</button>
                ) : null}
                <button className="danger" type="button" disabled={isSaving} onClick={() => runBlogAction(blog, 'delete')}>Xóa</button>
              </div>
            </article>
          ))}

          {filteredBlogs.length === 0 && !isLoading ? (
            <section className="empty-products">
              <h2>Chưa có bài viết phù hợp</h2>
            </section>
          ) : null}
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
              <label>Mã tác giả<input name="maTacGia" type="number" value={formData.maTacGia} onChange={handleFormChange} /></label>
              <label>Tiêu đề<input required name="tieuDe" value={formData.tieuDe} onChange={handleFormChange} /></label>
              <label>Hình ảnh<input name="hinhAnh" value={formData.hinhAnh} onChange={handleFormChange} /></label>
              <label>Chủ đề<input name="chuDe" value={formData.chuDe} onChange={handleFormChange} /></label>
              <label>Tỉnh/thành<input name="tenTinh" value={formData.tenTinh} onChange={handleFormChange} /></label>
              <label>
                Trạng thái
                <select name="trangThai" value={formData.trangThai} onChange={handleFormChange}>
                  {Object.entries(statusOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="blog-form-full">Mô tả<textarea name="moTa" rows="3" value={formData.moTa} onChange={handleFormChange} /></label>
              <label className="blog-form-full">Nội dung<textarea className="blog-content-input" name="noiDung" rows="8" value={formData.noiDung} onChange={handleFormChange} /></label>
              <label className="blog-form-full">relatedProductIds<input name="relatedProductIds" value={formData.relatedProductIds} onChange={handleFormChange} placeholder="1,2,3" /></label>
            </div>

            <div className="blog-modal-actions">
              <button type="button" disabled={isSaving} onClick={closeFormModal}>Hủy</button>
              <button className="button" type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {detailBlog ? (
        <div className="blog-modal-backdrop" role="presentation">
          <section className="blog-modal blog-detail-modal">
            <div className="blog-modal-heading">
              <span>{getStatusLabel(detailBlog.status)}</span>
              <h2>{detailBlog.title}</h2>
            </div>
            <div className="blog-detail-meta">
              <span>{getTopicLabel(detailBlog)}</span>
              <span>{detailBlog.province || 'Đang cập nhật'}</span>
              <span>{detailBlog.author || detailBlog.authorId || 'Đang cập nhật'}</span>
              <span>{detailBlog.createdAt || detailBlog.publishedDate || 'Đang cập nhật'}</span>
              <span>{Number(detailBlog.views || 0).toLocaleString('vi-VN')} lượt xem</span>
            </div>
            <p className="blog-detail-summary">{detailBlog.description || detailBlog.summary}</p>
            <p className="blog-detail-content">{detailBlog.content}</p>
            <div className="blog-related-products">
              <h3>Sản phẩm liên quan</h3>
              {detailBlog.relatedProductIds?.length > 0 ? (
                <div>
                  {detailBlog.relatedProductIds.map((productId) => <span key={productId}>{productId}</span>)}
                </div>
              ) : (
                <p>Chưa gắn sản phẩm liên quan.</p>
              )}
            </div>
            <div className="blog-modal-actions">
              <button type="button" onClick={() => setDetailBlog(null)}>Đóng</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default BlogManagementPage
