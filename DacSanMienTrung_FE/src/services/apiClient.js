import { getToken } from '../utils/authStorage'

const API_BASE_URL = 'http://localhost:8090/api'

async function requestApi(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`

    try {
      const errorPayload = await response.json()
      errorMessage =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.data?.message ||
        errorMessage
    } catch {
      try {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      } catch {
        // Keep the status fallback when the backend does not return a readable body.
      }
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

export const getApi = (path) => requestApi(path)

export const postApi = (path, data) =>
  requestApi(path, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const putApi = (path, data) =>
  requestApi(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteApi = (path) =>
  requestApi(path, {
    method: 'DELETE',
  })

