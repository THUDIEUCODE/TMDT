import { postApi } from './apiClient'

export const createReview = async (data) => {
  return postApi('/reviews', data)
}
