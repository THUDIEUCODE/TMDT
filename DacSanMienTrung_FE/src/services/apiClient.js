const API_BASE_URL = 'http://localhost:8090/api'

async function requestApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
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

