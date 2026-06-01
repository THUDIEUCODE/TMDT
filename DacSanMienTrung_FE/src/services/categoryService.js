import { getApi } from './apiClient'

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
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

export const mapCategoryFromApi = (apiCategory = {}) => {
  const id = apiCategory.maDanhMuc ?? apiCategory.id
  const name = apiCategory.tenDanhMuc ?? apiCategory.name ?? 'Danh mục'

  return {
    ...apiCategory,
    id: String(id ?? name),
    parentId: apiCategory.maDanhMucCha ?? apiCategory.parentId ?? null,
    name,
    slug: String(apiCategory.slug ?? id ?? name),
    description: apiCategory.moTa ?? apiCategory.description ?? '',
    displayOrder: apiCategory.thuTuHienThi ?? apiCategory.displayOrder ?? 0,
    status: apiCategory.trangThai ?? apiCategory.status ?? 'active',
    image: apiCategory.image ?? createInitials(name),
    productCount: apiCategory.soSanPham ?? apiCategory.productCount ?? 0,
    subCategories: apiCategory.subCategories ?? [],
  }
}

export const getCategories = async () => {
  const payload = await getApi('/categories')
  return getArrayPayload(payload).map(mapCategoryFromApi)
}

export const getCategoryById = async (id) => {
  const payload = await getApi(`/categories/${id}`)
  return mapCategoryFromApi(payload?.data ?? payload)
}

