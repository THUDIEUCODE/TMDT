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
  String(value || 'SP')
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

  if (status === 'active' || status === 'dangBan' || status === 1 || status === 'true') {
    return true
  }

  if (status === 'hidden' || status === 'tamAn' || status === 0 || status === 'false') {
    return false
  }

  return true
}

const mapVariantFromApi = (variant = {}, productId) => {
  const id = variant.maBienThe ?? variant.id ?? `${productId}-variant`
  const weight = variant.trongLuong ?? variant.weight ?? ''
  const packaging = variant.quyCachDongGoi ?? variant.packaging ?? variant.quyCach ?? variant.label ?? ''
  const label =
    variant.tenBienThe ||
    variant.label ||
    [weight, packaging].filter(Boolean).join(' - ') ||
    'Mặc định'

  return {
    ...variant,
    id: String(id),
    variantId: String(id),
    maBienThe: id,
    productId: String(variant.maSanPham ?? variant.productId ?? productId ?? ''),
    weight,
    packaging,
    label,
    price: Number(variant.giaBan ?? variant.gia ?? variant.price ?? 0),
    stock: Number(variant.soLuongTon ?? variant.tonKho ?? variant.stock ?? 0),
    expiryDate: variant.hanSuDung ?? variant.expiryDate ?? '',
    image: variant.hinhAnh ?? variant.image ?? '',
    status: normalizeStatus(variant.trangThai ?? variant.status),
  }
}

export const mapProductFromApi = (apiProduct = {}) => {
  const product = getPayload(apiProduct) || {}
  const id = product.maSanPham ?? product.id
  const name = product.tenSanPham ?? product.name ?? 'Sản phẩm'
  const categoryId = product.maDanhMuc ?? product.categoryId ?? product.categorySlug ?? ''
  const categoryName = product.tenDanhMuc ?? product.categoryName ?? product.category ?? product.subCategory ?? ''
  const province = product.tenTinh ?? product.province ?? product.origin ?? ''
  const price = Number(product.giaBanThapNhat ?? product.giaBan ?? product.price ?? 0)
  const listedPrice = Number(product.giaNiemYet ?? product.listedPrice ?? product.oldPrice ?? price)
  const apiVariants = product.bienThes ?? product.bienThe ?? product.variants
  const variants = Array.isArray(apiVariants)
    ? apiVariants.map((variant) => mapVariantFromApi(variant, id))
    : []
  const stock = Number(
    product.tongTonKho ??
      product.stock ??
      variants.reduce((total, variant) => total + Number(variant.stock || 0), 0),
  )
  const status = normalizeStatus(product.trangThai ?? product.status)

  return {
    ...product,
    id: String(id ?? name),
    name,
    slug: String(product.slug ?? id ?? name),
    categoryId: String(categoryId),
    categorySlug: String(product.categorySlug ?? categoryId),
    categoryName,
    category: categoryName,
    subCategory: product.subCategory ?? categoryName,
    province,
    origin: province,
    region: product.vungMien ?? product.region ?? '',
    image: product.hinhAnh || product.image || createInitials(name),
    imageUrl: product.hinhAnh || product.imageUrl || '',
    listedPrice,
    price,
    oldPrice: listedPrice,
    stock,
    variantCount: Number(product.soBienThe ?? product.variantCount ?? variants.length),
    status,
    description: product.moTa ?? product.description ?? '',
    ingredients: product.thanhPhan ?? product.ingredients ?? 'Đang cập nhật.',
    storageGuide: product.huongDanBaoQuan ?? product.storageGuide ?? 'Đang cập nhật.',
    culturalStory: product.dacTrungVanHoa ?? product.cauChuyenVanHoa ?? product.culturalStory ?? '',
    history: product.lichSuSanPham ?? product.history ?? '',
    provinceCulture: product.moTaVanHoaTinh ?? product.provinceCulture ?? '',
    rating: Number(product.rating ?? 5),
    variants:
      variants.length > 0
        ? variants
        : [
            {
              id: `${id ?? name}-default`,
              variantId: `${id ?? name}-default`,
              maBienThe: id ?? name,
              productId: String(id ?? ''),
              weight: '',
              packaging: 'Mặc định',
              label: 'Mặc định',
              price,
              stock,
              expiryDate: '',
              image: '',
              status,
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
  return mapProductFromApi(payload)
}

export const getProductsByCategory = async (categoryId) => {
  const payload = await getApi(`/products/category/${categoryId}`)
  return getArrayPayload(payload).map(mapProductFromApi)
}

export const getProductsByCategoryTree = async (categoryId) => {
  const payload = await getApi(`/products/category-tree/${categoryId}`)
  return getArrayPayload(payload).map(mapProductFromApi)
}

export const createProduct = async (data) => {
  const payload = await postApi('/products', data)
  return mapProductFromApi(payload)
}

export const updateProduct = async (id, data) => {
  const payload = await putApi(`/products/${id}`, data)
  return mapProductFromApi(payload)
}

export const toggleProduct = async (id) => {
  const payload = await putApi(`/products/${id}/toggle`)
  return mapProductFromApi(payload)
}

export const deleteProduct = async (id) => deleteApi(`/products/${id}`)
