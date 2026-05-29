# Yêu cầu Frontend Website Đặc sản miền Trung

Tạo frontend bằng React + Vite + JavaScript + CSS thuần.

Không dùng TypeScript.
Không dùng Tailwind.
Dùng react-router-dom.
Chưa cần kết nối backend.
Dùng dữ liệu mẫu trong thư mục src/data.

## Cấu trúc thư mục cần tạo

src/
├── assets/
│   ├── images/
│   └── styles/
│       ├── variables.css
│       ├── global.css
│       └── responsive.css
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── product/
│   ├── cart/
│   ├── order/
│   ├── combo/
│   └── blog/
│
├── pages/
│   ├── auth/
│   ├── customer/
│   ├── staff/
│   └── admin/
│
├── data/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx

## Các trang cần có

Auth:
- LoginPage.jsx
- RegisterPage.jsx
- ForgotPasswordPage.jsx

Khách hàng:
- HomePage.jsx
- ProductListPage.jsx
- ProductDetailPage.jsx
- CartPage.jsx
- CheckoutInfoPage.jsx
- PaymentPage.jsx
- OrderSuccessPage.jsx
- OrderHistoryPage.jsx
- OrderDetailPage.jsx
- ComboGiftPage.jsx
- BlogListPage.jsx
- BlogDetailPage.jsx
- ProfilePage.jsx

Nhân viên:
- StaffDashboardPage.jsx
- ProductManagementPage.jsx
- CategoryManagementPage.jsx
- InventoryPage.jsx
- OrderManagementPage.jsx
- ReturnManagementPage.jsx
- ReviewManagementPage.jsx
- BlogManagementPage.jsx

Quản trị viên:
- AdminDashboardPage.jsx
- AccountManagementPage.jsx
- VoucherManagementPage.jsx
- ReportPage.jsx

## Dữ liệu mẫu

Tạo:
- mockProducts.js
- mockCategories.js
- mockBlogs.js
- mockOrders.js
- mockUsers.js
- mockVouchers.js
- mockCombos.js

Sản phẩm mẫu phải đúng đặc sản miền Trung:
- Mè xửng Huế
- Mắm ruốc Huế
- Mực rim me Đà Nẵng
- Bánh khô mè Quảng Nam
- Tỏi Lý Sơn
- Chả bò Đà Nẵng
- Nước mắm Nam Ô
- Cá khô Nha Trang
- Yến sào Khánh Hòa
- Bánh tráng Đại Lộc
- Mì Quảng khô
- Trà cung đình Huế

## Route cần tạo

/
 /products
/products/:id
/cart
/checkout
/payment
/order-success
/orders
/orders/:id
/combo-gift
/blogs
/blogs/:id
/login
/register

/staff/dashboard
/staff/products
/staff/categories
/staff/orders
/staff/inventory
/staff/returns
/staff/reviews
/staff/blogs

/admin/dashboard
/admin/accounts
/admin/vouchers
/admin/reports

## Yêu cầu code

Code đơn giản, dễ hiểu.
Mỗi page/component tách file riêng.
Dùng CSS thuần.
Ưu tiên chạy được trước, chưa cần giao diện quá đẹp.