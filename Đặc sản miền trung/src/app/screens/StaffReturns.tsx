import { StaffLayout } from "./StaffLayout";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { Check, X, MessageSquare, Eye } from "lucide-react";
import { useState } from "react";

const requests = [
  {
    id: "#RT2026042501",
    order: "#DM2026041205",
    customer: "Nguyễn Văn An",
    date: "25/04/2026",
    product: products[2],
    qty: 1,
    amount: 95000,
    reason: "Hàng lỗi / bị hỏng",
    desc: "Hũ mắm bị nứt nắp, ruốc chảy ra ngoài khi nhận hàng.",
    status: "pending",
  },
  {
    id: "#RT2026042498",
    order: "#DM2026041180",
    customer: "Trần Thị Hoa",
    date: "24/04/2026",
    product: products[3],
    qty: 2,
    amount: 240000,
    reason: "Không đúng mô tả",
    desc: "Sản phẩm có mùi khác so với mô tả, không phải sả chanh nguyên chất.",
    status: "pending",
  },
  {
    id: "#RT2026042490",
    order: "#DM2026041100",
    customer: "Lê Minh Tuấn",
    date: "22/04/2026",
    product: products[4],
    qty: 1,
    amount: 75000,
    reason: "Không muốn nữa",
    desc: "Nhận quá nhiều quà cùng lúc, muốn trả lại.",
    status: "approved",
  },
  {
    id: "#RT2026042485",
    order: "#DM2026041050",
    customer: "Phạm Văn B",
    date: "20/04/2026",
    product: products[0],
    qty: 1,
    amount: 185000,
    reason: "Hàng lỗi / bị hỏng",
    desc: "Dây vòng đứt sau 3 ngày sử dụng.",
    status: "refunded",
  },
  {
    id: "#RT2026042478",
    order: "#DM2026040980",
    customer: "Võ Hoàng Nam",
    date: "18/04/2026",
    product: products[1],
    qty: 3,
    amount: 195000,
    reason: "Khác",
    desc: "Giao sai địa chỉ, không nhận được.",
    status: "rejected",
  },
];

const tabs = [
  { id: "all", label: "Tất cả", color: "#6C3483" },
  { id: "pending", label: "Chờ xử lý", color: "#F39C12" },
  { id: "approved", label: "Đã duyệt", color: "#2874A6" },
  { id: "refunded", label: "Đã hoàn tiền", color: "#1E8449" },
  { id: "rejected", label: "Từ chối", color: "#C0392B" },
];

export function StaffReturns() {
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState<any>(null);

  const filtered = tab === "all" ? requests : requests.filter(r => r.status === tab);

  const stats = [
    { label: "Yêu cầu chờ xử lý", value: requests.filter(r => r.status === "pending").length, color: "#F39C12" },
    { label: "Đã duyệt hôm nay", value: 1, color: "#2874A6" },
    { label: "Đã hoàn tiền tuần này", value: 8, color: "#1E8449" },
    { label: "Tổng giá trị hoàn", value: "1.8M₫", color: "#C0392B" },
  ];

  const statusLabel = (s: string) => tabs.find(t => t.id === s)?.label || s;
  const statusColor = (s: string) => tabs.find(t => t.id === s)?.color || "#95a5a6";

  return (
    <StaffLayout title="Xử lý hoàn hàng">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border-l-4" style={{ borderLeftColor: s.color }}>
            <div className="text-sm text-gray-600">{s.label}</div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm ${
              tab === t.id ? "text-white" : "bg-white hover:bg-[#FDF6E3]"
            }`}
            style={tab === t.id ? { backgroundColor: t.color } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FDF6E3]">
            <tr className="text-left">
              <th className="px-4 py-3">Mã YC</th>
              <th className="px-4 py-3">Đơn gốc</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Lý do</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                <td className="px-4 py-3 text-[#C0392B]" style={{ fontWeight: 600 }}>{r.id}</td>
                <td className="px-4 py-3 text-gray-600">{r.order}</td>
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded bg-[#FDF6E3] overflow-hidden shrink-0">
                      <ImageWithFallback src={r.product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-xs">{r.product.name}</div>
                      <div className="text-xs text-gray-500">x{r.qty}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{r.reason}</td>
                <td className="px-4 py-3" style={{ fontWeight: 600 }}>{r.amount.toLocaleString("vi-VN")}₫</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: statusColor(r.status) }}>
                    {statusLabel(r.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(r)} className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#2874A6]" title="Xem chi tiết">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[560px] bg-white h-full p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
                Yêu cầu {selected.id}
              </h2>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>

            <div className="bg-[#FDF6E3] rounded-xl p-4 text-sm mb-4">
              <div className="flex justify-between py-1"><span className="text-gray-600">Đơn gốc</span><span className="text-[#C0392B]" style={{ fontWeight: 600 }}>{selected.order}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-600">Khách hàng</span><span>{selected.customer}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-600">Ngày gửi</span><span>{selected.date}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-600">Giá trị hoàn</span><span style={{ fontWeight: 700 }}>{selected.amount.toLocaleString("vi-VN")}₫</span></div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white border rounded-xl mb-4">
              <div className="w-16 h-16 rounded-lg bg-[#FDF6E3] overflow-hidden">
                <ImageWithFallback src={selected.product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm">{selected.product.name}</div>
                <div className="text-xs text-gray-500">Số lượng: {selected.qty}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-1" style={{ fontWeight: 600 }}>Lý do hoàn hàng</div>
              <div className="p-3 bg-[#FDF6E3] rounded-xl text-sm">{selected.reason}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-1" style={{ fontWeight: 600 }}>Mô tả chi tiết</div>
              <div className="p-3 bg-[#FDF6E3] rounded-xl text-sm text-gray-700">{selected.desc}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-2" style={{ fontWeight: 600 }}>Hình ảnh minh chứng</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-[#FDF6E3] flex items-center justify-center text-gray-400">
                    📷
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-1" style={{ fontWeight: 600 }}>Phản hồi cho khách</div>
              <textarea rows={3} placeholder="Nhập phản hồi..." className="w-full px-3 py-2 bg-[#FDF6E3] rounded-xl resize-none text-sm" />
            </div>

            {selected.status === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 bg-[#1E8449] text-white rounded-full flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  <Check className="w-4 h-4" /> Duyệt & Hoàn tiền
                </button>
                <button className="py-2.5 bg-[#C0392B] text-white rounded-full flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  <X className="w-4 h-4" /> Từ chối
                </button>
              </div>
            )}
            {selected.status !== "pending" && (
              <button className="w-full py-2.5 bg-[#6C3483] text-white rounded-full flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Liên hệ khách
              </button>
            )}
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
