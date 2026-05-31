export const returnStatusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  refunded: 'Đã hoàn tiền',
  rejected: 'Từ chối',
}

export const returnReasonLabels = {
  defective: 'Hàng lỗi',
  wrongItem: 'Giao sai sản phẩm',
  damagedShipping: 'Hư hỏng khi vận chuyển',
  other: 'Khác',
}

export const mockReturns = [
  {
    id: 'RH20260501001',
    orderId: 'DH20260501006',
    customerName: 'Đặng Thu Thảo',
    phone: '0966 221 009',
    requestDate: '03/05/2026',
    reason: 'damagedShipping',
    description: 'Hộp quà bị móp góc, một sản phẩm bên trong bị rách bao bì.',
    evidence: ['Ảnh hộp quà móp góc', 'Ảnh bao bì bị rách'],
    status: 'pending',
    handlingNote: '',
    items: [
      {
        id: 'return-item-1',
        name: 'Hộp quà đặc sản miền Trung',
        variant: 'Cao cấp',
        quantity: 1,
        price: 690000,
      },
    ],
  },
  {
    id: 'RH20260512002',
    orderId: 'DH20260512004',
    customerName: 'Phạm Gia Hân',
    phone: '0988 120 455',
    requestDate: '15/05/2026',
    reason: 'wrongItem',
    description: 'Khách đặt mực rim me hũ 500g nhưng nhận nhầm hũ 200g.',
    evidence: ['Ảnh sản phẩm đã nhận'],
    status: 'approved',
    handlingNote: 'Đã xác minh với bộ phận đóng gói, đủ điều kiện hoàn tiền phần chênh lệch.',
    items: [
      {
        id: 'return-item-2',
        name: 'Mực rim me Đà Nẵng',
        variant: 'Hũ 500g',
        quantity: 1,
        price: 215000,
      },
    ],
  },
  {
    id: 'RH20260420003',
    orderId: 'DH20260420008',
    customerName: 'Nguyễn Tấn Lộc',
    phone: '0912 331 678',
    requestDate: '22/04/2026',
    reason: 'defective',
    description: 'Nắp chai nước mắm bị rò rỉ trong quá trình vận chuyển.',
    evidence: ['Ảnh chai bị rò'],
    status: 'refunded',
    handlingNote: 'Đã hoàn tiền qua ví điện tử ngày 23/04/2026.',
    items: [
      {
        id: 'return-item-3',
        name: 'Nước mắm Nam Ô',
        variant: 'Chai 750ml',
        quantity: 2,
        price: 95000,
      },
    ],
  },
  {
    id: 'RH20260405004',
    orderId: 'DH20260405005',
    customerName: 'Võ Thanh Bình',
    phone: '0977 445 882',
    requestDate: '06/04/2026',
    reason: 'other',
    description: 'Khách đổi ý sau khi đã nhận hàng, sản phẩm không có lỗi.',
    evidence: [],
    status: 'rejected',
    handlingNote: 'Từ chối vì sản phẩm không lỗi và đã quá thời gian hỗ trợ đổi trả theo chính sách.',
    items: [
      {
        id: 'return-item-4',
        name: 'Tỏi Lý Sơn',
        variant: '500g',
        quantity: 1,
        price: 120000,
      },
    ],
  },
]

export const getReturnTotal = (returnRequest) =>
  returnRequest.items.reduce((total, item) => total + item.price * item.quantity, 0)
