import { RouterProvider, useRouter } from "./components/router";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { HomePage } from "./screens/HomePage";
import { CategoryPage } from "./screens/CategoryPage";
import { ProductDetailPage } from "./screens/ProductDetailPage";
import { CartPage } from "./screens/CartPage";
import { CheckoutAddressPage } from "./screens/CheckoutAddressPage";
import { CheckoutPaymentPage } from "./screens/CheckoutPaymentPage";
import { OrderConfirmPage } from "./screens/OrderConfirmPage";
import { LoginPage, RegisterPage } from "./screens/AuthPages";
import { AccountPage } from "./screens/AccountPage";
import { TrackingPage } from "./screens/TrackingPage";
import { ReturnPage } from "./screens/ReturnPage";
import { BlogListPage, BlogDetailPage } from "./screens/BlogPages";
import { ComboBuilderPage } from "./screens/ComboBuilderPage";
import { StaffDashboard } from "./screens/StaffDashboard";
import { StaffOrders } from "./screens/StaffOrders";
import { StaffProducts } from "./screens/StaffProducts";
import { StaffInventory } from "./screens/StaffInventory";
import { StaffReviews } from "./screens/StaffReviews";
import { StaffBlog } from "./screens/StaffBlog";
import { StaffReturns } from "./screens/StaffReturns";
import { AdminDashboard } from "./screens/AdminDashboard";
import { AdminAccounts } from "./screens/AdminAccounts";
import { AdminVouchers } from "./screens/AdminVouchers";

function Screens() {
  const { screen } = useRouter();

  switch (screen) {
    case "home": return <HomePage />;
    case "category": return <CategoryPage />;
    case "product": return <ProductDetailPage />;
    case "cart": return <CartPage />;
    case "checkout-address": return <CheckoutAddressPage />;
    case "checkout-payment": return <CheckoutPaymentPage />;
    case "order-confirm": return <OrderConfirmPage />;
    case "login": return <LoginPage />;
    case "register": return <RegisterPage />;
    case "account": return <AccountPage />;
    case "tracking": return <TrackingPage />;
    case "return": return <ReturnPage />;
    case "blog": return <BlogListPage />;
    case "blog-detail": return <BlogDetailPage />;
    case "combo-builder": return <ComboBuilderPage />;
    case "staff-dashboard": return <StaffDashboard />;
    case "staff-orders": return <StaffOrders />;
    case "staff-products": return <StaffProducts />;
    case "staff-inventory": return <StaffInventory />;
    case "staff-reviews": return <StaffReviews />;
    case "staff-blog": return <StaffBlog />;
    case "staff-returns": return <StaffReturns />;
    case "admin-dashboard": return <AdminDashboard />;
    case "admin-accounts": return <AdminAccounts />;
    case "admin-vouchers": return <AdminVouchers />;
    default: return <HomePage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <Screens />
      <RoleSwitcher />
    </RouterProvider>
  );
}
