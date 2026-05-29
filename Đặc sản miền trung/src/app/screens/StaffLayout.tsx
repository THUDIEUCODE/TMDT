import {
  LayoutDashboard, ShoppingBag, Package, Warehouse, Star, FileText, RotateCcw,
  Users, Ticket, BarChart3, Flower2, Bell,
} from "lucide-react";
import { useRouter, Screen } from "../components/router";
import { ReactNode } from "react";

export function StaffLayout({
  children, title, isAdmin = false,
}: { children: ReactNode; title: string; isAdmin?: boolean }) {
  const { navigate, screen } = useRouter();

  const staffMenu: { Icon: any; label: string; target: Screen }[] = [
    { Icon: LayoutDashboard, label: "Dashboard", target: "staff-dashboard" },
    { Icon: ShoppingBag, label: "Đơn hàng", target: "staff-orders" },
    { Icon: Package, label: "Sản phẩm", target: "staff-products" },
    { Icon: Warehouse, label: "Tồn kho", target: "staff-inventory" },
    { Icon: Star, label: "Đánh giá", target: "staff-reviews" },
    { Icon: FileText, label: "Blog", target: "staff-blog" },
    { Icon: RotateCcw, label: "Hoàn hàng", target: "staff-returns" },
  ];

  const adminMenu: { Icon: any; label: string; target: Screen }[] = [
    { Icon: LayoutDashboard, label: "Dashboard", target: "admin-dashboard" },
    { Icon: Users, label: "Tài khoản", target: "admin-accounts" },
    { Icon: Ticket, label: "Voucher", target: "admin-vouchers" },
    { Icon: Package, label: "Sản phẩm", target: "staff-products" },
    { Icon: ShoppingBag, label: "Đơn hàng", target: "staff-orders" },
  ];

  const menu = isAdmin ? adminMenu : staffMenu;
  const accent = isAdmin ? "#6C3483" : "#1E8449";

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-5 border-b flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center">
            <Flower2 className="w-6 h-6 text-[#F39C12]" />
          </div>
          <div>
            <div className="text-sm" style={{ fontFamily: "Playfair Display, serif", fontWeight: 700 }}>
              Đặc Sản MT
            </div>
            <div className="text-xs" style={{ color: accent }}>
              {isAdmin ? "Quản trị viên" : "Nhân viên"}
            </div>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {menu.map((m) => (
            <button
              key={m.label}
              onClick={() => navigate(m.target)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left text-sm ${
                screen === m.target ? "text-white" : "hover:bg-[#FDF6E3]"
              }`}
              style={screen === m.target ? { backgroundColor: accent } : {}}
            >
              <m.Icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate("home")}
          className="m-3 px-3 py-2 text-xs text-gray-500 hover:text-[#C0392B] border-t pt-4"
        >
          ← Về trang khách
        </button>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>{title}</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-[#FDF6E3] rounded-full">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-[#C0392B] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">5</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C0392B] to-[#6C3483] text-white flex items-center justify-center text-xs" style={{ fontWeight: 700 }}>
                {isAdmin ? "QTV" : "NV"}
              </div>
              <div className="text-sm">
                <div style={{ fontWeight: 600 }}>{isAdmin ? "Lê Hoàng Admin" : "Nguyễn NV"}</div>
                <div className="text-xs text-gray-500">{isAdmin ? "admin@..." : "staff@..."}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
