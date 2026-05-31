export const mockStaffStats = {
  todayOrders: 18,
  pendingOrders: 6,
  shippingOrders: 9,
  todayRevenue: 12480000,
  lowStockProducts: 5,
  pendingReturns: 3,
  pendingReviews: 7,
}

export const mockStaffTasks = [
  {
    id: 'task-orders',
    title: 'Xác nhận đơn hàng mới',
    description: 'Kiểm tra thanh toán, địa chỉ nhận và chuyển đơn sang đóng gói.',
    count: 6,
    path: '/staff/orders',
  },
  {
    id: 'task-returns',
    title: 'Duyệt hoàn hàng',
    description: 'Xem lý do hoàn hàng và phản hồi khách trong ngày.',
    count: 3,
    path: '/staff/returns',
  },
  {
    id: 'task-reviews',
    title: 'Duyệt đánh giá',
    description: 'Ẩn nội dung không phù hợp và phản hồi đánh giá cần hỗ trợ.',
    count: 7,
    path: '/staff/reviews',
  },
  {
    id: 'task-products',
    title: 'Cập nhật sản phẩm sắp hết hàng',
    description: 'Bổ sung tồn kho hoặc tạm ẩn biến thể còn ít số lượng.',
    count: 5,
    path: '/staff/inventory',
  },
]
