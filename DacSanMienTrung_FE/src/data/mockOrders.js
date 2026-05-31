export const orderStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
  returning: 'Đang hoàn hàng',
}

export const orderStatusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: orderStatusLabels.pending },
  { value: 'confirmed', label: orderStatusLabels.confirmed },
  { value: 'shipping', label: orderStatusLabels.shipping },
  { value: 'completed', label: orderStatusLabels.completed },
  { value: 'cancelled', label: orderStatusLabels.cancelled },
  { value: 'returning', label: orderStatusLabels.returning },
]

const syncOrderShape = (order) => {
  const subtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0)
  const total = subtotal + order.shippingFee - order.discount

  return {
    ...order,
    code: order.code || order.id,
    phone: order.phone || order.receiverPhone,
    address: order.address || order.shippingAddress,
    receiverName: order.receiverName || order.customerName,
    receiverPhone: order.receiverPhone || order.phone,
    shippingAddress: order.shippingAddress || order.address,
    subtotal,
    total,
    timeline: order.statusHistory,
  }
}

export const mockOrders = [
  {
    id: 'DH20260529001',
    code: 'DH20260529001',
    orderDate: '29/05/2026',
    customerName: 'Nguyễn Minh Anh',
    phone: '0935 122 618',
    address: '128 Trần Phú, Hải Châu, Đà Nẵng',
    paymentMethod: 'COD',
    note: 'Giao giờ hành chính, gọi trước khi đến.',
    status: 'pending',
    shippingFee: 25000,
    discount: 30000,
    items: [
      { id: 'item-1', name: 'Mè xửng Huế', image: 'MX', variant: 'Hộp 500g', quantity: 2, price: 89000 },
      { id: 'item-2', name: 'Trà cung đình Huế', image: 'TR', variant: 'Gói 250g', quantity: 1, price: 125000 },
      { id: 'item-3', name: 'Bánh khô mè Quảng Nam', image: 'KM', variant: 'Túi 300g', quantity: 1, price: 69000 },
    ],
    statusHistory: [
      { time: '29/05/2026 08:30', label: 'Đơn hàng được tạo' },
      { time: '29/05/2026 08:35', label: 'Đang chờ cửa hàng xác nhận' },
    ],
  },
  {
    id: 'DH20260528002',
    code: 'DH20260528002',
    orderDate: '28/05/2026',
    customerName: 'Trần Hoài Nam',
    phone: '0905 884 211',
    address: '45 Nguyễn Huệ, Quy Nhơn, Bình Định',
    paymentMethod: 'Chuyển khoản',
    note: 'Đã chuyển khoản, cần xuất hóa đơn.',
    status: 'confirmed',
    shippingFee: 0,
    discount: 50000,
    items: [
      { id: 'item-4', name: 'Chả bò Đà Nẵng', image: 'CB', variant: 'Đòn 1kg', quantity: 1, price: 400000 },
      { id: 'item-5', name: 'Nước mắm Nam Ô', image: 'NM', variant: 'Chai 750ml', quantity: 2, price: 95000 },
    ],
    statusHistory: [
      { time: '28/05/2026 09:10', label: 'Đơn hàng được tạo' },
      { time: '28/05/2026 09:45', label: 'Nhân viên đã xác nhận đơn hàng' },
    ],
  },
  {
    id: 'DH20260428003',
    code: 'DH20260428003',
    orderDate: '28/04/2026',
    customerName: 'Lê Chi',
    phone: '0914 334 667',
    address: '12 Phan Chu Trinh, Hội An, Quảng Nam',
    paymentMethod: 'Ví điện tử',
    note: 'Để hàng tại quầy lễ tân nếu khách không có nhà.',
    status: 'shipping',
    shippingFee: 25000,
    discount: 0,
    items: [
      { id: 'item-7', name: 'Bánh tráng Đại Lộc', image: 'BT', variant: 'Xấp 20 cái', quantity: 3, price: 39000 },
      { id: 'item-8', name: 'Mì Quảng khô', image: 'MQ', variant: 'Túi 500g', quantity: 2, price: 52000 },
    ],
    statusHistory: [
      { time: '28/04/2026 14:05', label: 'Đơn hàng được tạo' },
      { time: '28/04/2026 15:00', label: 'Cửa hàng đã xác nhận' },
      { time: '29/04/2026 08:45', label: 'Đơn hàng đang giao' },
    ],
  },
  {
    id: 'DH20260512004',
    code: 'DH20260512004',
    orderDate: '12/05/2026',
    customerName: 'Phạm Gia Hân',
    phone: '0988 120 455',
    address: '88 Lê Lợi, Nha Trang, Khánh Hòa',
    paymentMethod: 'Chuyển khoản',
    note: 'Gói quà giúp khách.',
    status: 'completed',
    shippingFee: 0,
    discount: 80000,
    items: [
      { id: 'item-9', name: 'Mực rim me Đà Nẵng', image: 'MR', variant: 'Hũ 500g', quantity: 2, price: 215000 },
      { id: 'item-10', name: 'Yến sào Khánh Hòa', image: 'YS', variant: '50g', quantity: 1, price: 1250000 },
    ],
    statusHistory: [
      { time: '12/05/2026 10:15', label: 'Đơn hàng được tạo' },
      { time: '12/05/2026 11:20', label: 'Cửa hàng đã xác nhận' },
      { time: '13/05/2026 09:00', label: 'Đơn hàng đang giao' },
      { time: '14/05/2026 16:40', label: 'Giao hàng thành công' },
    ],
  },
  {
    id: 'DH20260405005',
    code: 'DH20260405005',
    orderDate: '05/04/2026',
    customerName: 'Võ Thanh Bình',
    phone: '0977 445 882',
    address: '25 Hùng Vương, Quảng Ngãi',
    paymentMethod: 'COD',
    note: '',
    status: 'cancelled',
    cancelReason: 'Khách đổi địa chỉ nhận hàng và muốn đặt lại đơn mới.',
    shippingFee: 25000,
    discount: 0,
    items: [
      { id: 'item-11', name: 'Tỏi Lý Sơn', image: 'TLS', variant: '500g', quantity: 1, price: 120000 },
      { id: 'item-12', name: 'Kẹo cu đơ Hà Tĩnh', image: 'CD', variant: 'Hộp 10 cái', quantity: 1, price: 78000 },
    ],
    statusHistory: [
      { time: '05/04/2026 09:10', label: 'Đơn hàng được tạo' },
      { time: '05/04/2026 09:30', label: 'Khách hàng đã hủy đơn' },
    ],
  },
  {
    id: 'DH20260501006',
    code: 'DH20260501006',
    orderDate: '01/05/2026',
    customerName: 'Đặng Thu Thảo',
    phone: '0966 221 009',
    address: '19 Bạch Đằng, Huế',
    paymentMethod: 'Ví điện tử',
    note: 'Khách yêu cầu kiểm tra tình trạng hộp quà.',
    status: 'returning',
    shippingFee: 25000,
    discount: 40000,
    items: [
      { id: 'item-13', name: 'Hộp quà đặc sản miền Trung', image: 'QG', variant: 'Cao cấp', quantity: 1, price: 690000 },
    ],
    statusHistory: [
      { time: '01/05/2026 08:00', label: 'Đơn hàng được tạo' },
      { time: '01/05/2026 09:15', label: 'Cửa hàng đã xác nhận' },
      { time: '02/05/2026 10:00', label: 'Giao hàng thành công' },
      { time: '03/05/2026 14:30', label: 'Khách yêu cầu hoàn hàng' },
    ],
  },
].map(syncOrderShape)

export const getOrderSubtotal = (order) =>
  order.items.reduce((total, item) => total + item.price * item.quantity, 0)

export const getOrderTotal = (order) =>
  getOrderSubtotal(order) + order.shippingFee - order.discount

export const mockOrderSuccess = {
  id: 'DH20260529001',
  receiverName: 'Nguyễn Minh Anh',
  shippingAddress: '128 Trần Phú, Hải Châu, Đà Nẵng',
  paymentMethod: 'Thanh toán khi nhận hàng COD',
  total: 342000,
  status: orderStatusLabels.pending,
}
