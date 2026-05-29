import { StaffLayout } from "./StaffLayout";
import { Eye, Check, X, Search } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "pending", label: "Chờ xác nhận", color: "#F39C12", count: 12 },
  { id: "processing", label: "Đang xử lý", color: "#6C3483", count: 8 },
  { id: "shipping", label: "Đang giao", color: "#2874A6", count: 28 },
  { id: "done", label: "Đã giao", color: "#1E8449", count: 145 },
  { id: "cancel", label: "Đã hủy", color: "#95a5a6", count: 4 },
];

const rows = [
  { id: "#DM2026042501", customer: "Nguyễn Văn An", items: "3 sản phẩm", total: 325000, status: "Chờ xác nhận", color: "#F39C12", date: "25/04/2026" },
  { id: "#DM2026042500", customer: "Trần Thị Hoa", items: "Combo Tết", total: 890000, status: "Đang giao", color: "#2874A6", date: "24/04/2026" },
  { id: "#DM2026042499", customer: "Lê Minh Tuấn", items: "Tinh dầu x2", total: 240000, status: "Đã giao", color: "#1E8449", date: "23/04/2026" },
  { id: "#DM2026042498", customer: "Phạm Văn B", items: "Vòng tay phong thủy", total: 185000, status: "Chờ xác nhận", color: "#F39C12", date: "25/04/2026" },
  { id: "#DM2026042497", customer: "Võ Hoàng Nam", items: "Combo Huế", total: 1250000, status: "Đóng gói", color: "#6C3483", date: "25/04/2026" },
  { id: "#DM2026042496", customer: "Đỗ Minh Thư", items: "4 sản phẩm", total: 615000, status: "Đang giao", color: "#2874A6", date: "24/04/2026" },
];

export function StaffOrders() {
  const [active, setActive] = useState("pending");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <StaffLayout title="Quản lý đơn hàng">
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              active === t.id ? "text-white" : "bg-white hover:bg-[#FDF6E3]"
            }`}
            style={active === t.id ? { backgroundColor: t.color } : {}}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${active === t.id ? "bg-white/30" : "bg-gray-100"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Tìm mã đơn, tên khách..." className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg outline-none" />
        </div>
        <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg text-sm">
          <option>Tất cả thời gian</option>
          <option>Hôm nay</option>
          <option>7 ngày qua</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FDF6E3]">
            <tr className="text-left">
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">Sản phẩm</th>
              <th className="px-5 py-3">Tổng tiền</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Ngày đặt</th>
              <th className="px-5 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                <td className="px-5 py-3 text-[#C0392B]" style={{ fontWeight: 600 }}>{r.id}</td>
                <td className="px-5 py-3">{r.customer}</td>
                <td className="px-5 py-3 text-gray-600">{r.items}</td>
                <td className="px-5 py-3" style={{ fontWeight: 600 }}>{r.total.toLocaleString("vi-VN")}₫</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: r.color }}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{r.date}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setSelected(r.id)} className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#2874A6]" title="Xem"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#1E8449]" title="Xác nhận"><Check className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#C0392B]" title="Hủy"><X className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[500px] bg-white h-full p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>Chi tiết {selected}</h2>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-[#FDF6E3] rounded-xl p-4 text-sm">
                <div><strong>Khách:</strong> Nguyễn Văn An · 0901 234 567</div>
                <div><strong>Địa chỉ:</strong> 128 Trần Phú, Đà Nẵng</div>
                <div><strong>Ghi chú:</strong> Giao giờ hành chính</div>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ fontWeight: 600 }}>Cập nhật trạng thái</label>
                <select className="w-full px-4 py-2 bg-[#FDF6E3] rounded-xl">
                  <option>Chờ xác nhận</option>
                  <option>Đóng gói</option>
                  <option>Đang giao</option>
                  <option>Đã giao</option>
                </select>
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ fontWeight: 600 }}>Mã vận đơn</label>
                <input className="w-full px-4 py-2 bg-[#FDF6E3] rounded-xl" placeholder="GHN..." />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ fontWeight: 600 }}>Ghi chú nội bộ</label>
                <textarea rows={3} className="w-full px-4 py-2 bg-[#FDF6E3] rounded-xl resize-none" />
              </div>
              <button className="w-full py-2.5 bg-[#1E8449] text-white rounded-full" style={{ fontWeight: 600 }}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
