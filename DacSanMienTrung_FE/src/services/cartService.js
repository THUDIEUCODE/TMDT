import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items
  }

  if (Array.isArray(payload?.cartItems)) {
    return payload.cartItems
  }

  if (Array.isArray(payload?.content)) {
    return payload.content
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
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

export const mapCartItemFromApi = (apiItem = {}) => {
  const cartItemId = apiItem.maGioHang ?? apiItem.cartItemId ?? apiItem.id
  const productId = apiItem.maSanPham ?? apiItem.productId ?? ''
  const variantId = apiItem.maBienThe ?? apiItem.variantId ?? ''
  const name = apiItem.tenSanPham ?? apiItem.name ?? 'Sản phẩm'
  const variantName =
    apiItem.variantName ||
    apiItem.variantLabel ||
    [apiItem.trongLuong, apiItem.quyCachDongGoi].filter(Boolean).join(' - ') ||
    'Mặc định'
  const price = Number(apiItem.donGia ?? apiItem.price ?? 0)
  const quantity = Number(apiItem.soLuong ?? apiItem.quantity ?? 1)
  const total = Number(apiItem.thanhTien ?? apiItem.total ?? price * quantity)

  return {
    ...apiItem,
    id: String(cartItemId ?? `${productId}-${variantId}`),
    cartItemId: String(cartItemId ?? ''),
    productId: String(productId),
    variantId: String(variantId),
    name,
    variantName,
    variantLabel: variantName,
    image: apiItem.hinhAnh || apiItem.image || createInitials(name),
    price,
    quantity,
    total,
    stock: Number(apiItem.soLuongTon ?? apiItem.stock ?? 0),
  }
}

export const getCart = async (maNguoiDung) => {
  const payload = await getApi(`/cart/${maNguoiDung}`)
  return getArrayPayload(payload).map(mapCartItemFromApi)
}

export const addToCart = async (data) => {
  return postApi('/cart/add', data)
}

export const updateCartItem = async (maGioHang, data) => {
  return putApi(`/cart/items/${maGioHang}`, data)
}

export const deleteCartItem = async (maGioHang) => {
  return deleteApi(`/cart/items/${maGioHang}`)
}

export const clearCart = async (maNguoiDung) => {
  return deleteApi(`/cart/clear/${maNguoiDung}`)
}
