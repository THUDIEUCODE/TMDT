import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.data?.content)) {
    return payload.data.content
  }

  if (Array.isArray(payload?.content)) {
    return payload.content
  }

  return []
}

const createInitials = (value) =>
  String(value || 'DM')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

const normalizeStatus = (status) => {
  if (status === true || status === false) {
    return status
  }

  if (status === 'active' || status === 'dangHienThi' || status === 1 || status === 'true') {
    return true
  }

  if (status === 'hidden' || status === 'tamAn' || status === 0 || status === 'false') {
    return false
  }

  return true
}

export const mapCategoryFromApi = (apiCategory = {}) => {
  const category = getPayload(apiCategory) || {}
  const id = category.maDanhMuc ?? category.id
  const parentId = category.maDanhMucCha ?? category.parentId ?? null
  const name = category.tenDanhMuc ?? category.name ?? 'Danh mục'

  return {
    ...category,
    id: String(id ?? name),
    parentId: parentId === null || parentId === undefined || parentId === '' ? null : String(parentId),
    name,
    slug: String(category.slug ?? id ?? name),
    description: category.moTa ?? category.description ?? '',
    displayOrder: Number(category.thuTuHienThi ?? category.displayOrder ?? 0),
    status: normalizeStatus(category.trangThai ?? category.status),
    hinhAnh: category.hinhAnh ?? category.image ?? '',
    image: category.hinhAnh ?? category.image ?? createInitials(name),
    productCount: Number(category.soSanPham ?? category.productCount ?? 0),
    childCount: Number(category.soDanhMucCon ?? category.childCount ?? 0),
    subCategories: category.subCategories ?? [],
  }
}

export const getCategories = async () => {
  const payload = await getApi('/categories')
  return getArrayPayload(payload).map(mapCategoryFromApi)
}

export const getManageCategories = async () => {
  const payload = await getApi('/categories/manage')
  return getArrayPayload(payload).map(mapCategoryFromApi)
}

export const getRootCategories = async () => {
  const payload = await getApi('/categories/root')
  return getArrayPayload(payload).map(mapCategoryFromApi)
}

export const getCategoryById = async (id) => {
  const payload = await getApi(`/categories/${id}`)
  return mapCategoryFromApi(payload)
}

export const getManageCategoryById = async (id) => {
  const payload = await getApi(`/categories/manage/${id}`)
  return mapCategoryFromApi(payload)
}

export const getChildCategories = async (id) => {
  const payload = await getApi(`/categories/${id}/children`)
  return getArrayPayload(payload).map(mapCategoryFromApi)
}

export const createCategory = async (data) => {
  const payload = await postApi('/categories', data)
  return mapCategoryFromApi(payload)
}

export const updateCategory = async (id, data) => {
  const payload = await putApi(`/categories/${id}`, data)
  return mapCategoryFromApi(payload)
}

export const toggleCategory = async (id) => {
  const payload = await putApi(`/categories/${id}/toggle`)
  return mapCategoryFromApi(payload)
}

export const deleteCategory = async (id) => deleteApi(`/categories/${id}`)
