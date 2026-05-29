import { StaffLayout } from "./StaffLayout";
import { Users, Ticket, UserCheck, FileBarChart, TrendingUp } from "lucide-react";
import { useRouter } from "../components/router";

const revenueData = [28, 45, 38, 62, 55, 78, 65, 88, 72, 95, 83, 110];
const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const max = Math.max(...revenueData);

const topProducts = [
  { name: "Mắm ruốc Dì Cẩn", sold: 328, rev: 31200000 },
  { name: "Bánh tráng Đà Nẵng", sold: 287, rev: 18655000 },
  { name: "Tinh dầu sả chanh", sold: 215, rev: 25800000 },
  { name: "Vòng tay phong thủy", sold: 198, rev: 36630000 },
];

const provinceSales = [
  { name: "Huế", v: 95, color: "#6C3483" },
  { name: "Đà Nẵng", v: 88, color: "#C0392B" },
  { name: "Quảng Nam", v: 72, color: "#1E8449" },
  { name: "Khánh Hòa", v: 58, color: "#16A085" },
  { name: "Bình Định", v: 45, color: "#F39C12" },
];

export function AdminDashboard() {
  const { navigate } = useRouter();

  return (
    <StaffLayout title="Dashboard Quản trị viên" isAdmin>
      <div className="grid md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Doanh thu tháng", value: "285M₫", sub: "+18.5% ↗", color: "#C0392B" },
          { label: "Đơn hàng", value: "1,245", sub: "+12.3% ↗", color: "#F39C12" },
          { label: "Khách hàng mới", value: "324", sub: "+8.1% ↗", color: "#1E8449" },
          { label: "Tỷ lệ chuyển đổi", value: "4.2%", sub: "+0.5% ↗", color: "#6C3483" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border-l-4" style={{ borderLeftColor: s.color }}>
            <div className="text-sm text-gray-600">{s.label}</div>
            <div className="mt-1" style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-[#1E8449] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl p-5">
          <h3 className="mb-4" style={{ fontWeight: 600 }}>Biểu đồ doanh thu 2026 (triệu ₫)</h3>
          <div className="flex items-end gap-2 h-48">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#C0392B] to-[#F39C12] hover:opacity-80 transition-opacity relative group"
                  style={{ height: `${(v / max) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">{v}M</div>
                </div>
                <div className="text-xs text-gray-500">{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h3 className="mb-4" style={{ fontWeight: 600 }}>Doanh thu theo tỉnh</h3>
          <div className="space-y-3">
            {provinceSales.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>📍 {p.name}</span>
                  <span style={{ fontWeight: 600 }}>{p.v}M₫</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.v}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-5">
        {[
          { Icon: Users, label: "Nhân viên", value: "24", action: () => navigate("admin-accounts"), color: "#1E8449" },
          { Icon: Ticket, label: "Voucher", value: "18", action: () => navigate("admin-accounts"), color: "#F39C12" },
          { Icon: UserCheck, label: "Tài khoản", value: "5.2K", action: () => navigate("admin-accounts"), color: "#6C3483" },
          { Icon: FileBarChart, label: "Báo cáo", value: "Xem", action: () => {}, color: "#C0392B" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={c.action}
            className="bg-white rounded-2xl p-5 text-left hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white" style={{ backgroundColor: c.color }}>
              <c.Icon className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-600">{c.label}</div>
            <div style={{ fontSize: "22px", fontWeight: 700 }}>{c.value}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5">
          <h3 className="mb-4" style={{ fontWeight: 600 }}>Sản phẩm bán chạy</h3>
          <table className="w-full text-sm">
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name} className="border-b last:border-0">
                  <td className="py-2.5 w-8 text-[#C0392B]" style={{ fontWeight: 700 }}>#{i + 1}</td>
                  <td className="py-2.5">{p.name}</td>
                  <td className="py-2.5 text-right text-gray-500">{p.sold} đơn</td>
                  <td className="py-2.5 text-right" style={{ fontWeight: 600 }}>{(p.rev / 1000000).toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h3 className="mb-4" style={{ fontWeight: 600 }}>Nhật ký hoạt động</h3>
          <div className="space-y-3 text-sm">
            {[
              { time: "09:32", action: "NV Lan Anh cập nhật trạng thái đơn #DM2026042500" },
              { time: "09:15", action: "Đơn mới #DM2026042501 (325.000₫)" },
              { time: "08:48", action: "Voucher TETSUM2026 được sử dụng 12 lần" },
              { time: "08:30", action: "NV Minh Tuấn thêm sản phẩm mới 'Bánh in Huế'" },
              { time: "08:00", action: "Hệ thống backup dữ liệu thành công" },
            ].map((l, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xs text-gray-400 w-10 pt-0.5">{l.time}</span>
                <span className="text-gray-700">{l.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
