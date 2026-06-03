import { deleteApi, getApi, postApi, putApi } from './apiClient'
import { mapProductFromApi } from './productService'

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

export const mapVariantFromApi = (variant = {}) => {
  const mappedProduct = mapProductFromApi({ maSanPham: variant.maSanPham, bienThes: [variant] })
  return mappedProduct.variants[0]
}

export const getVariantsByProduct = async (maSanPham) => {
  const payload = await getApi(`/variants/product/${maSanPham}`)
  return getArrayPayload(payload).map(mapVariantFromApi)
}

export const createVariant = async (data) => {
  const payload = await postApi('/variants', data)
  return mapVariantFromApi(payload)
}

export const updateVariant = async (id, data) => {
  const payload = await putApi(`/variants/${id}`, data)
  return mapVariantFromApi(payload)
}

export const toggleVariant = async (id) => {
  const payload = await putApi(`/variants/${id}/toggle`)
  return mapVariantFromApi(payload)
}

export const deleteVariant = async (id) => deleteApi(`/variants/${id}`)
