import { postApi } from './apiClient'

export const createReturnRequest = async (data) => {
  return postApi('/returns', data)
}
