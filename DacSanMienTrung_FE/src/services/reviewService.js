import { deleteApi, getApi, postApi, putApi } from './apiClient'

const getPayload = (payload) => payload?.data ?? payload

const getArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.content)) return payload.data.content
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

export const mapReviewFromApi = (apiReview = {}) => {
  const review = getPayload(apiReview) || {}
  const id = review.maChiTietDonHang ?? review.id ?? review.orderItemId
  const approved = Boolean(review.daKiemDuyetDanhGia ?? review.approved ?? false)
  const productName = review.tenSanPham ?? review.productName ?? review.name ?? 'Sản phẩm'
  const variantName =
    review.tenBienThe ||
    review.variant ||
    review.variantName ||
    [review.trongLuong, review.quyCachDongGoi].filter(Boolean).join(' - ') ||
    'Mặc định'

  return {
    ...review,
    id: String(id ?? ''),
    maChiTietDonHang: id,
    orderItemId: id,
    orderId: review.maDonHang ?? review.orderId ?? '',
    customerId: review.maNguoiDung ?? review.customerId ?? '',
    customerName: review.hoTenNguoiDung ?? review.customerName ?? review.hoTenKhachHang ?? 'Khách hàng',
    productId: review.maSanPham ?? review.productId ?? '',
    productName,
    productImage:
      review.hinhAnhSanPham ||
      review.hinhAnh ||
      review.productImage ||
      String(productName)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase(),
    variant: variantName,
    variantName,
    rating: Number(review.soSao ?? review.rating ?? 0),
    content: review.noiDungDanhGia ?? review.content ?? '',
    reviewDate: review.ngayDanhGia ?? review.reviewDate ?? '',
    approved,
    status: approved ? 'approved' : 'pending',
  }
}

export const createReview = async (data) => {
  const payload = await postApi('/reviews', data)
  return mapReviewFromApi(payload)
}

export const getReviews = async (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== 'all') {
    params.set('status', filters.status)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const payload = await getApi(`/reviews${query}`)
  return getArrayPayload(payload).map(mapReviewFromApi)
}

export const getReviewsByProduct = async (maSanPham) => {
  const payload = await getApi(`/reviews/product/${maSanPham}`)
  return getArrayPayload(payload).map(mapReviewFromApi)
}

export const getReviewsByUser = async (maNguoiDung) => {
  const payload = await getApi(`/reviews/user/${maNguoiDung}`)
  return getArrayPayload(payload).map(mapReviewFromApi)
}

export const approveReview = async (maChiTietDonHang) => {
  const payload = await putApi(`/reviews/${maChiTietDonHang}/approve`)
  return payload ? mapReviewFromApi(payload) : null
}

export const hideReview = async (maChiTietDonHang) => {
  const payload = await putApi(`/reviews/${maChiTietDonHang}/hide`)
  return payload ? mapReviewFromApi(payload) : null
}

export const deleteReview = async (maChiTietDonHang) => deleteApi(`/reviews/${maChiTietDonHang}`)
