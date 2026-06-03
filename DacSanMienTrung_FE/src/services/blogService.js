import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.content)) return payload.data.content
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

const createInitials = (value) =>
  String(value || 'Blog')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

const normalizeStatus = (status) => {
  if (status === true || status === 'published' || status === 'daXuatBan' || status === 'true') {
    return 'published'
  }

  if (status === false || status === 'hidden' || status === 'daAn' || status === 'false') {
    return 'hidden'
  }

  return status || 'draft'
}

const normalizeRelatedProductIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item?.maSanPham ?? item?.id ?? item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export const mapBlogFromApi = (apiBlog = {}) => {
  const blog = getPayload(apiBlog) || {}
  const id = blog.maBlog ?? blog.id
  const title = blog.tieuDe ?? blog.title ?? ''
  const summary = blog.moTa ?? blog.summary ?? blog.description ?? ''
  const image = blog.hinhAnh ?? blog.image ?? blog.thumbnail ?? createInitials(title)
  const topic = blog.chuDe ?? blog.topic ?? ''
  const province = blog.tenTinh ?? blog.province ?? ''
  const author = blog.tenTacGia ?? blog.authorName ?? blog.author ?? blog.maTacGia ?? ''
  const createdAt = blog.ngayDang ?? blog.ngayTao ?? blog.createdAt ?? blog.publishedDate ?? ''
  const relatedProductIds = normalizeRelatedProductIds(
    blog.relatedProductIds ?? blog.sanPhamLienQuanIds ?? blog.maSanPhamLienQuan,
  )

  return {
    ...blog,
    id: String(id ?? title),
    maBlog: id,
    title,
    slug: String(id ?? blog.slug ?? title),
    category: blog.category ?? topic,
    hinhAnh: blog.hinhAnh ?? blog.image ?? blog.thumbnail ?? '',
    thumbnail: image,
    image,
    summary,
    description: summary,
    content: blog.noiDung ?? blog.content ?? '',
    author,
    authorId: blog.maTacGia ?? blog.authorId ?? '',
    topic,
    province,
    createdAt,
    publishedDate: blog.ngayDang ?? blog.publishedDate ?? createdAt,
    views: Number(blog.luotXem ?? blog.views ?? 0),
    status: normalizeStatus(blog.trangThai ?? blog.status),
    relatedProductIds,
    relatedProducts: blog.relatedProducts ?? blog.sanPhamLienQuan ?? [],
  }
}

export const getBlogs = async () => {
  const payload = await getApi('/blogs')
  return getArrayPayload(payload).map(mapBlogFromApi)
}

export const getBlogById = async (id) => {
  const payload = await getApi(`/blogs/${id}`)
  return mapBlogFromApi(payload)
}

export const getAllBlogsForAdmin = async () => {
  const payload = await getApi('/blogs/admin/all')
  return getArrayPayload(payload).map(mapBlogFromApi)
}

export const createBlog = async (data) => {
  const payload = await postApi('/blogs', data)
  return mapBlogFromApi(payload)
}

export const updateBlog = async (id, data) => {
  const payload = await putApi(`/blogs/${id}`, data)
  return mapBlogFromApi(payload)
}

export const hideBlog = async (id) => {
  const payload = await putApi(`/blogs/${id}/hide`)
  return payload ? mapBlogFromApi(payload) : null
}

export const publishBlog = async (id) => {
  const payload = await putApi(`/blogs/${id}/publish`)
  return payload ? mapBlogFromApi(payload) : null
}

export const deleteBlog = async (id) => deleteApi(`/blogs/${id}`)
