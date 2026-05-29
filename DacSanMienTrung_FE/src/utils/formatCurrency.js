export function formatCurrency(value) {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}
