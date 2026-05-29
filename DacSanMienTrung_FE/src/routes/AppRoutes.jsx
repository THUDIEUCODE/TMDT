import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import HomePage from '../pages/customer/HomePage'
import CategoryOverviewPage from '../pages/customer/CategoryOverviewPage'
import CategoryProductPage from '../pages/customer/CategoryProductPage'
import ProductListPage from '../pages/customer/ProductListPage'
import ProductDetailPage from '../pages/customer/ProductDetailPage'
import CartPage from '../pages/customer/CartPage'
import CheckoutInfoPage from '../pages/customer/CheckoutInfoPage'
import PaymentPage from '../pages/customer/PaymentPage'
import OrderSuccessPage from '../pages/customer/OrderSuccessPage'
import OrderHistoryPage from '../pages/customer/OrderHistoryPage'
import OrderDetailPage from '../pages/customer/OrderDetailPage'
import ComboGiftPage from '../pages/customer/ComboGiftPage'
import BlogListPage from '../pages/customer/BlogListPage'
import BlogDetailPage from '../pages/customer/BlogDetailPage'
import ProfilePage from '../pages/customer/ProfilePage'
import StaffDashboardPage from '../pages/staff/StaffDashboardPage'
import ProductManagementPage from '../pages/staff/ProductManagementPage'
import CategoryManagementPage from '../pages/staff/CategoryManagementPage'
import InventoryPage from '../pages/staff/InventoryPage'
import OrderManagementPage from '../pages/staff/OrderManagementPage'
import ReturnManagementPage from '../pages/staff/ReturnManagementPage'
import ReviewManagementPage from '../pages/staff/ReviewManagementPage'
import BlogManagementPage from '../pages/staff/BlogManagementPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AccountManagementPage from '../pages/admin/AccountManagementPage'
import VoucherManagementPage from '../pages/admin/VoucherManagementPage'
import ReportPage from '../pages/admin/ReportPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryOverviewPage />} />
          <Route path="/categories/:categorySlug" element={<CategoryProductPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutInfoPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/combo-gift" element={<ComboGiftPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          <Route path="/staff/products" element={<ProductManagementPage />} />
          <Route path="/staff/categories" element={<CategoryManagementPage />} />
          <Route path="/staff/orders" element={<OrderManagementPage />} />
          <Route path="/staff/inventory" element={<InventoryPage />} />
          <Route path="/staff/returns" element={<ReturnManagementPage />} />
          <Route path="/staff/reviews" element={<ReviewManagementPage />} />
          <Route path="/staff/blogs" element={<BlogManagementPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/accounts" element={<AccountManagementPage />} />
          <Route path="/admin/vouchers" element={<VoucherManagementPage />} />
          <Route path="/admin/reports" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
