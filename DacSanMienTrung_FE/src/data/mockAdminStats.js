export const revenueLastSevenDays = [
  { label: '25/05', revenue: 3200000 },
  { label: '26/05', revenue: 4800000 },
  { label: '27/05', revenue: 3900000 },
  { label: '28/05', revenue: 5600000 },
  { label: '29/05', revenue: 7200000 },
  { label: '30/05', revenue: 6100000 },
  { label: '31/05', revenue: 8400000 },
]

export const topSellingProducts = [
  {
    id: 'top-1',
    name: 'Mè xửng Huế',
    category: 'Đặc sản Huế',
    sold: 186,
    revenue: 16740000,
  },
  {
    id: 'top-2',
    name: 'Chả bò Đà Nẵng',
    category: 'Đặc sản Đà Nẵng',
    sold: 92,
    revenue: 29440000,
  },
  {
    id: 'top-3',
    name: 'Mực rim me Đà Nẵng',
    category: 'Đặc sản biển',
    sold: 118,
    revenue: 25370000,
  },
  {
    id: 'top-4',
    name: 'Hộp quà đặc sản miền Trung',
    category: 'Quà biếu đặc sản',
    sold: 45,
    revenue: 17550000,
  },
]

export const adminAlerts = [
  {
    id: 'alert-locked',
    title: 'Tài khoản bị khóa',
    description: 'Có 2 tài khoản khách hàng bị khóa cần kiểm tra lý do.',
    path: '/admin/accounts',
  },
  {
    id: 'alert-voucher',
    title: 'Voucher sắp hết hạn',
    description: '3 voucher khuyến mãi sẽ hết hạn trong 7 ngày tới.',
    path: '/admin/vouchers',
  },
  {
    id: 'alert-stock',
    title: 'Sản phẩm tồn kho thấp',
    description: '5 biến thể sản phẩm dưới ngưỡng cảnh báo tồn kho.',
    path: '/staff/inventory',
  },
  {
    id: 'alert-return',
    title: 'Yêu cầu hoàn hàng chưa xử lý',
    description: 'Có 3 yêu cầu hoàn hàng đang chờ nhân viên duyệt.',
    path: '/staff/returns',
  },
]

export const lockedAccountCount = 2
export const expiringVoucherCount = 3
