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
