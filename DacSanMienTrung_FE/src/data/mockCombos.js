export const mockComboTypes = [
  { id: 'nguyenDan', label: 'Nguyên Đán', description: 'Hộp quà sum vầy cho dịp tết cổ truyền.' },
  { id: 'trungThu', label: 'Trung Thu', description: 'Quà ấm áp cho mùa trăng đoàn viên.' },
  { id: 'sinhNhat', label: 'Sinh nhật', description: 'Combo nhỏ xinh gửi lời chúc cá nhân.' },
  { id: 'quaBieu', label: 'Quà biếu', description: 'Lịch sự, chỉn chu dành cho đối tác và người thân.' },
  { id: 'khac', label: 'Khác', description: 'Tự do phối quà theo câu chuyện riêng.' },
]

export const mockCombos = [
  {
    id: 'combo-hue',
    name: 'Combo Hương vị Huế',
    description: 'Mè xửng Huế, mắm ruốc Huế, trà cung đình Huế.',
    price: 198000,
    type: 'quaBieu',
  },
  {
    id: 'combo-da-nang',
    name: 'Combo Đà Nẵng làm quà',
    description: 'Mực rim me, chả bò và nước mắm Nam Ô.',
    price: 420000,
    type: 'nguyenDan',
  },
  {
    id: 'combo-quang',
    name: 'Combo xứ Quảng',
    description: 'Bánh khô mè, bánh tráng Đại Lộc và mì Quảng khô.',
    price: 165000,
    type: 'trungThu',
  },
]

export const mockPurchasedCombos = [
  {
    id: 'gift-001',
    name: 'Hộp quà Tết miền Trung',
    occasion: 'Tết Nguyên Đán',
    message: 'Chúc gia đình một năm mới an khang, đậm đà hương vị quê nhà.',
    status: 'Đã mua',
    total: 685000,
    products: ['Chả bò Đà Nẵng', 'Mè xửng Huế', 'Trà cung đình Huế', 'Bánh khô mè Quảng Nam'],
  },
  {
    id: 'gift-002',
    name: 'Combo gửi thương về Huế',
    occasion: 'Quà biếu ba mẹ',
    message: 'Con gửi chút vị miền Trung, mong ba mẹ luôn mạnh khỏe.',
    status: 'Đang chuẩn bị',
    total: 438000,
    products: ['Mắm ruốc Huế', 'Mè xửng Huế', 'Trà cung đình Huế'],
  },
  {
    id: 'gift-003',
    name: 'Giỏ quà Hội An',
    occasion: 'Sinh nhật bạn thân',
    message: 'Một món quà nhỏ cho người mê đồ ăn xứ Quảng.',
    status: 'Đã lưu',
    total: 312000,
    products: ['Bánh tráng Đại Lộc', 'Mì Quảng khô', 'Bánh khô mè'],
  },
]
