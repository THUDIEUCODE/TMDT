import { mockProducts } from './mockProducts'

const cartProductIds = ['me-xung-hue', 'muc-rim-me-da-nang', 'tra-cung-dinh-hue']

export const mockCartItems = cartProductIds.map((productId, index) => {
  const product = mockProducts.find((item) => item.id === productId)
  const variant = product.variants[index % product.variants.length]

  return {
    id: `cart-${product.id}`,
    productId: product.id,
    name: product.name,
    image: product.image,
    variantId: variant.id,
    variantLabel: variant.label,
    province: product.province,
    price: variant.price,
    quantity: index + 1,
    stock: variant.stock,
  }
})

export const mockCartVoucher = {
  code: 'MT10',
  discountAmount: 30000,
}
