import { getApi, postApi } from './apiClient'

export const login = async (data) => {
  return postApi('/auth/login', data)
}

export const register = async (data) => {
  return postApi('/auth/register', data)
}

export const getUserById = async (id) => {
  return getApi(`/auth/users/${id}`)
}

export const getUserByEmail = async (email) => {
  return getApi(`/auth/users/email?email=${encodeURIComponent(email)}`)
}
