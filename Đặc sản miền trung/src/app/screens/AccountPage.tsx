import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { useRouter } from "../components/router";
import { User, Package, MapPin, Star, Gift, LogOut, Award } from "lucide-react";
import { useState } from "react";

export function AccountPage() {
  const { navigate } = useRouter();
  const [filter, setFilter] = useState("all");

  const menu = [
    { Icon: User, label: "Thông tin cá nhân" },
    { Icon: Package, label: "Đơn hàng", active: true },
    { Icon: MapPin, label: "Địa chỉ" },
    { Icon: Award, label: "Điểm tích lũy" },
    { Icon: Star, label: "Đánh giá" },
    { Icon: Gift, label: "Combo quà tặng" },
    { Icon: LogOut, label: "Đăng xuất" },
  ];

  const filters = [
    { id: "all", label: "Tất cả", color: "gray" },
    { id: "pending", label: "Chờ xác nhận", color: "#F39C12" },
    { id: "shipping", label: "Đang giao", color: "#2874A6" },
    { id: "done", label: "Đã giao", color: "#1E8449" },
    { id: "cancel", label: "Đã hủy", color: "#95a5a6" },
    { id: "return", label: "Đang hoàn hàng", color: "#C0392B" },
  ];

  const orders = [
    { id: "#DM2026042501", date: "25/04/2026", items: "Mắm ruốc Dì Cẩn + 2 sản phẩm khác", total: 325000, status: "pending", statusLabel: "Chờ xác nhận", color: "#F39C12" },
    { id: "#DM2026042398", date: "18/04/2026", items: "Combo Tết Huế cao cấp", total: 890000, status: "shipping", statusLabel: "Đang giao", color: "#2874A6" },
    { id: "#DM2026041205", date: "05/04/2026", items: "Tinh dầu sả chanh × 2", total: 240000, status: "done", statusLabel: "Đã giao", color: "#1E8449" },
    { id: "#DM2026033015", date: "22/03/2026", items: "Vòng tay đá phong thủy", total: 185000, status: "done", statusLabel: "Đã giao", color: "#1E8449" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Tài khoản" }]} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-2xl p-4 h-fit">
          <div className="flex items-center gap-3 p-3 border-b mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C0392B] to-[#6C3483] flex items-center justify-center text-white" style={{ fontWeight: 700 }}>
              NA
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Nguyễn Văn An</div>
              <div className="text-xs text-gray-500">⭐ Thành viên Vàng</div>
            </div>
          </div>
          {menu.map((m) => (
            <button
              key={m.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left ${
                m.active ? "bg-[#FDF6E3] text-[#C0392B]" : "hover:bg-[#FDF6E3]"
              }`}
            >
              <m.Icon className="w-4 h-4" />
              <span className="text-sm">{m.label}</span>
            </button>
          ))}
        </aside>

        <div>
          <h1 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700 }}>
            Lịch sử đơn hàng
          </h1>

          <div className="flex gap-2 flex-wrap mb-5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  filter === f.id ? "bg-[#C0392B] text-white" : "bg-white hover:bg-[#FDF6E3]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-5">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3 mb-3">
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.id}</div>
                    <div className="text-xs text-gray-500">Đặt ngày {o.date}</div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs"
                    style={{ backgroundColor: o.color }}
                  >
                    {o.statusLabel}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <div className="text-sm text-gray-700">{o.items}</div>
                    <div className="text-[#C0392B] mt-1" style={{ fontWeight: 700 }}>
                      {o.total.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate("tracking")} className="px-3 py-1.5 text-sm border border-[#C0392B] text-[#C0392B] rounded-full hover:bg-[#FDF6E3]">
                      Xem chi tiết
                    </button>
                    {o.status === "done" && (
                      <button className="px-3 py-1.5 text-sm bg-[#F39C12] text-white rounded-full">Đánh giá</button>
                    )}
                    {o.status === "done" && (
                      <button onClick={() => navigate("return")} className="px-3 py-1.5 text-sm bg-white border rounded-full text-gray-600 hover:text-[#C0392B]">
                        Yêu cầu hoàn hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
