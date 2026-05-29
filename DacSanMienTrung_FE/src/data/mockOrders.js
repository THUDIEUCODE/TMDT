export const mockOrders = [
  { id: 'DH20260529001', customerName: 'Nguyễn Minh Anh', status: 'Chờ xác nhận', total: 447000 },
  { id: 'DH20260512002', customerName: 'Trần Bình', status: 'Đã giao', total: 1450000 },
  { id: 'DH20260428003', customerName: 'Lê Chi', status: 'Đang giao', total: 198000 },
]

export const mockOrderSuccess = {
  id: 'DH20260529001',
  receiverName: 'Nguyễn Minh Anh',
  shippingAddress: '128 Trần Phú, Hải Châu, Đà Nẵng',
  paymentMethod: 'Thanh toán khi nhận hàng COD',
  total: 447000,
  status: 'Chờ xác nhận',
}
