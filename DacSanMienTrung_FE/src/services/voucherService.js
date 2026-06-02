import { postApi } from './apiClient'

export const applyVoucher = async (data) => {
  return postApi('/vouchers/apply', data)
}
