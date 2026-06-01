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
  String(value || 'SP')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

const mapVariantFromApi = (variant, productId) => ({
  id: String(variant.maBienThe ?? variant.id ?? `${productId}-variant`),
  label: variant.tenBienThe ?? variant.label ?? variant.quyCach ?? 'Mặc định',
  price: Number(variant.giaBan ?? variant.gia ?? variant.price ?? 0),
  stock: Number(variant.tonKho ?? variant.stock ?? 0),
})

export const mapProductFromApi = (apiProduct = {}) => {
  const id = apiProduct.maSanPham ?? apiProduct.id
  const name = apiProduct.tenSanPham ?? apiProduct.name ?? 'Sản phẩm'
  const categoryId = apiProduct.maDanhMuc ?? apiProduct.categoryId ?? ''
  const categoryName = apiProduct.tenDanhMuc ?? apiProduct.categoryName ?? apiProduct.category ?? ''
  const province = apiProduct.tenTinh ?? apiProduct.province ?? apiProduct.origin ?? ''
  const price = Number(apiProduct.giaBanThapNhat ?? apiProduct.giaBan ?? apiProduct.price ?? 0)
  const variants = Array.isArray(apiProduct.bienThe)
    ? apiProduct.bienThe.map((variant) => mapVariantFromApi(variant, id))
    : Array.isArray(apiProduct.variants)
      ? apiProduct.variants.map((variant) => mapVariantFromApi(variant, id))
      : []

  return {
    ...apiProduct,
    id: String(id ?? name),
    name,
    slug: String(apiProduct.slug ?? id ?? name),
    categoryId: String(categoryId),
    categorySlug: String(apiProduct.categorySlug ?? categoryId),
    categoryName,
    category: categoryName,
    subCategory: apiProduct.subCategory ?? categoryName,
    province,
    origin: province,
    region: apiProduct.vungMien ?? apiProduct.region ?? '',
    image: apiProduct.hinhAnh || apiProduct.image || createInitials(name),
    price,
    oldPrice: Number(apiProduct.giaNiemYet ?? apiProduct.oldPrice ?? price),
    stock: Number(apiProduct.tongTonKho ?? apiProduct.stock ?? 0),
    variantCount: Number(apiProduct.soBienThe ?? apiProduct.variantCount ?? variants.length),
    status: apiProduct.trangThai ?? apiProduct.status ?? 'active',
    description: apiProduct.moTa ?? apiProduct.description ?? '',
    ingredients: apiProduct.thanhPhan ?? apiProduct.ingredients ?? 'Đang cập nhật.',
    storageGuide: apiProduct.huongDanBaoQuan ?? apiProduct.storageGuide ?? 'Đang cập nhật.',
    culturalStory: apiProduct.cauChuyenVanHoa ?? apiProduct.culturalStory ?? 'Đang cập nhật.',
    rating: Number(apiProduct.rating ?? 5),
    variants:
      variants.length > 0
        ? variants
        : [
            {
              id: `${id ?? name}-default`,
              label: 'Mặc định',
              price,
              stock: Number(apiProduct.tongTonKho ?? apiProduct.stock ?? 0),
            },
          ],
  }
}

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, value)
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export const getProducts = async (filters = {}) => {
  const payload = await getApi(`/products${buildQueryString(filters)}`)
  return getArrayPayload(payload).map(mapProductFromApi)
}

export const getProductById = async (id) => {
  const payload = await getApi(`/products/${id}`)
  return mapProductFromApi(payload?.data ?? payload)
}

export const getProductsByCategory = async (categoryId) => {
  const payload = await getApi(`/products/category/${categoryId}`)
  return getArrayPayload(payload).map(mapProductFromApi)
}

