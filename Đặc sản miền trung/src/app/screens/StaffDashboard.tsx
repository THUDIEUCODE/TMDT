import { StaffLayout } from "./StaffLayout";
import { AlertTriangle, MessageSquare } from "lucide-react";

const stats = [
  { label: "Đơn chờ xử lý", value: 12, color: "#F39C12", bg: "#F39C1220" },
  { label: "Đơn đang giao", value: 28, color: "#2874A6", bg: "#2874A620" },
  { label: "Yêu cầu hoàn hàng", value: 3, color: "#C0392B", bg: "#C0392B20" },
  { label: "Tổng đơn hôm nay", value: 47, color: "#1E8449", bg: "#1E844920" },
];

const recent = [
  { id: "#DM2026042501", customer: "Nguyễn Văn An", total: 325000, status: "Chờ xác nhận", color: "#F39C12" },
  { id: "#DM2026042500", customer: "Trần Thị Hoa", total: 890000, status: "Đang giao", color: "#2874A6" },
  { id: "#DM2026042499", customer: "Lê Minh Tuấn", total: 450000, status: "Đã giao", color: "#1E8449" },
  { id: "#DM2026042498", customer: "Phạm Văn B", total: 185000, status: "Chờ xác nhận", color: "#F39C12" },
  { id: "#DM2026042497", customer: "Võ Hoàng Nam", total: 1250000, status: "Đóng gói", color: "#6C3483" },
];

export function StaffDashboard() {
  return (
    <StaffLayout title="Dashboard nhân viên">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              <div style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</div>
            </div>
            <div className="text-sm text-gray-600">{s.label}</div>
            <div className="text-xs mt-1" style={{ color: s.color }}>+12% so với hôm qua ↗</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontWeight: 600 }}>Đơn hàng gần đây</h3>
            <button className="text-sm text-[#C0392B]">Xem tất cả →</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Mã đơn</th>
                <th className="pb-2">Khách hàng</th>
                <th className="pb-2">Tổng tiền</th>
                <th className="pb-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-3 text-[#C0392B]">{r.id}</td>
                  <td className="py-3">{r.customer}</td>
                  <td className="py-3" style={{ fontWeight: 600 }}>{r.total.toLocaleString("vi-VN")}₫</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: r.color }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5">
            <h3 className="flex items-center gap-2 mb-3" style={{ fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 text-[#C0392B]" /> Cảnh báo tồn kho
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { name: "Mắm ruốc Dì Cẩn", qty: 3 },
                { name: "Tinh dầu sả chanh", qty: 5 },
                { name: "Bánh tráng Đà Nẵng", qty: 8 },
              ].map((i) => (
                <div key={i.name} className="flex justify-between p-2 bg-[#FDF6E3] rounded-lg">
                  <span>{i.name}</span>
                  <span className="text-[#C0392B]" style={{ fontWeight: 600 }}>còn {i.qty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="flex items-center gap-2 mb-3" style={{ fontWeight: 600 }}>
              <MessageSquare className="w-4 h-4 text-[#F39C12]" /> Đánh giá chờ duyệt
            </h3>
            <div className="text-sm text-gray-600">7 đánh giá mới cần được kiểm duyệt.</div>
            <button className="mt-2 text-sm text-[#C0392B]">Xem & duyệt →</button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
