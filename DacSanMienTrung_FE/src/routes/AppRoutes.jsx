import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import AdminLayout from '../components/admin/AdminLayout'
import StaffLayout from '../components/staff/StaffLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import UnauthorizedPage from '../pages/auth/UnauthorizedPage'
import HomePage from '../pages/customer/HomePage'
import CategoryOverviewPage from '../pages/customer/CategoryOverviewPage'
import CategoryProductPage from '../pages/customer/CategoryProductPage'
import ProductListPage from '../pages/customer/ProductListPage'
import ProductDetailPage from '../pages/customer/ProductDetailPage'
import CartPage from '../pages/customer/CartPage'
import CheckoutInfoPage from '../pages/customer/CheckoutInfoPage'
import PaymentPage from '../pages/customer/PaymentPage'
import OrderSuccessPage from '../pages/customer/OrderSuccessPage'
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
import ReportPrintPage from '../pages/admin/ReportPrintPage'

const customerRoles = ['khachhang', 'nhanvien', 'quantrivien']
const staffRoles = ['nhanvien', 'quantrivien']
const adminRoles = ['quantrivien']

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
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <CheckoutInfoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <Navigate to="/profile" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/combo-gift" element={<ComboGiftPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={customerRoles}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={staffRoles}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="returns" element={<ReturnManagementPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="blogs" element={<BlogManagementPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={adminRoles}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="accounts" element={<AccountManagementPage />} />
            <Route path="vouchers" element={<VoucherManagementPage />} />
            <Route path="reports" element={<ReportPage />} />
            <Route path="reports/print" element={<ReportPrintPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
