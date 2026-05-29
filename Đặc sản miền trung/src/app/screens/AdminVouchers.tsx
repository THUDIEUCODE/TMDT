import { StaffLayout } from "./StaffLayout";
import { Plus, Edit, Trash2, Copy, Search, X, Ticket, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const vouchers = [
  { code: "TETSUM2026", type: "%", value: "30%", min: "500.000₫", remain: 145, used: 205, expire: "31/01/2026", active: true, gradient: "from-[#C0392B] to-[#6C3483]" },
  { code: "MIENTRUNG50", type: "₫", value: "50.000₫", min: "200.000₫", remain: 42, used: 158, expire: "30/04/2026", active: true, gradient: "from-[#1E8449] to-[#F39C12]" },
  { code: "NEWCUSTOMER", type: "₫", value: "30.000₫", min: "150.000₫", remain: 287, used: 213, expire: "31/12/2026", active: true, gradient: "from-[#6C3483] to-[#C0392B]" },
  { code: "HUEFEST", type: "%", value: "15%", min: "300.000₫", remain: 0, used: 100, expire: "15/03/2026", active: false, gradient: "from-[#F39C12] to-[#C0392B]" },
  { code: "FREESHIP", type: "ship", value: "Miễn phí ship", min: "400.000₫", remain: 500, used: 324, expire: "31/05/2026", active: true, gradient: "from-[#2874A6] to-[#1E8449]" },
  { code: "QUATET2026", type: "%", value: "20%", min: "800.000₫", remain: 78, used: 22, expire: "15/02/2026", active: true, gradient: "from-[#C0392B] to-[#F39C12]" },
];

export function AdminVouchers() {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = vouchers.filter(v => {
    if (filter === "active") return v.active;
    if (filter === "expired") return !v.active;
    return true;
  });

  const stats = [
    { label: "Voucher đang chạy", value: vouchers.filter(v => v.active).length, Icon: Ticket, color: "#1E8449" },
    { label: "Lượt sử dụng tháng", value: vouchers.reduce((s, v) => s + v.used, 0), Icon: TrendingUp, color: "#C0392B" },
    { label: "Sắp hết hạn", value: 2, Icon: Clock, color: "#F39C12" },
    { label: "Tổng giá trị đã giảm", value: "18.4M₫", Icon: CheckCircle2, color: "#6C3483" },
  ];

  return (
    <StaffLayout title="Quản lý voucher & khuyến mãi" isAdmin>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
              <s.Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-600">{s.label}</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 mb-4 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Tìm mã voucher..." className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg outline-none" />
        </div>
        <div className="flex gap-1">
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang chạy" },
            { id: "expired", label: "Hết hạn" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-lg text-sm ${
                filter === f.id ? "bg-[#6C3483] text-white" : "bg-[#FDF6E3]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[#FDF6E3] rounded-lg p-1">
          <button onClick={() => setView("grid")} className={`px-3 py-1 rounded ${view === "grid" ? "bg-white" : ""}`} title="Thẻ">▦</button>
          <button onClick={() => setView("table")} className={`px-3 py-1 rounded ${view === "table" ? "bg-white" : ""}`} title="Bảng">☰</button>
        </div>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 bg-[#F39C12] text-white rounded-lg text-sm flex items-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Tạo voucher
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div key={v.code} className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${v.gradient} p-5 text-white ${!v.active ? "opacity-60" : ""}`}>
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 15px)",
              }} />
              <div className="relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-white/80 mb-1">VOUCHER</div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: "32px", fontWeight: 700 }}>
                      {v.value}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${v.active ? "bg-white/20" : "bg-black/30"}`}>
                    {v.active ? "Đang chạy" : "Hết hạn"}
                  </span>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
                  <span style={{ fontWeight: 700, letterSpacing: "1px" }}>{v.code}</span>
                  <button className="text-white/80 hover:text-white" title="Sao chép">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-white/90 space-y-1 mb-3">
                  <div>Đơn tối thiểu: {v.min}</div>
                  <div>HSD: {v.expire}</div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span>Đã dùng: {v.used} / {v.used + v.remain}</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#F39C12]" style={{ width: `${(v.used / (v.used + v.remain)) * 100}%` }} />
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" /> Sửa
                  </button>
                  <button className="px-3 py-1.5 bg-white/20 hover:bg-[#C0392B] rounded-lg text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FDF6E3]">
              <tr className="text-left">
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Loại</th>
                <th className="px-5 py-3">Giá trị</th>
                <th className="px-5 py-3">Đơn tối thiểu</th>
                <th className="px-5 py-3">Đã dùng / Còn</th>
                <th className="px-5 py-3">Hết hạn</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.code} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                  <td className="px-5 py-3 text-[#C0392B]" style={{ fontWeight: 700 }}>{v.code}</td>
                  <td className="px-5 py-3">{v.type === "%" ? "Giảm %" : v.type === "ship" ? "Miễn ship" : "Giảm trực tiếp"}</td>
                  <td className="px-5 py-3" style={{ fontWeight: 600 }}>{v.value}</td>
                  <td className="px-5 py-3">{v.min}</td>
                  <td className="px-5 py-3"><span className="text-[#1E8449]">{v.used}</span> / <span className="text-gray-600">{v.remain}</span></td>
                  <td className="px-5 py-3 text-gray-500">{v.expire}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-white text-xs ${v.active ? "bg-[#1E8449]" : "bg-gray-400"}`}>
                      {v.active ? "Đang chạy" : "Hết hạn"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#2874A6]"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#C0392B]"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>Tạo voucher mới</h2>
              <button onClick={() => setModal(false)}><X /></button>
            </div>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="mb-1 block" style={{ fontWeight: 600 }}>Mã voucher</span>
                <input className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" placeholder="VD: TET2026" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Loại giảm</span>
                  <select className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg">
                    <option>Giảm %</option><option>Giảm trực tiếp</option><option>Miễn phí ship</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Giá trị</span>
                  <input className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Đơn tối thiểu</span>
                  <input className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
                </label>
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Số lượng</span>
                  <input type="number" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Bắt đầu</span>
                  <input type="date" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
                </label>
                <label className="block">
                  <span className="mb-1 block" style={{ fontWeight: 600 }}>Kết thúc</span>
                  <input type="date" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block" style={{ fontWeight: 600 }}>Mô tả</span>
                <textarea rows={2} className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg resize-none" />
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 border rounded-full">Hủy</button>
                <button className="flex-1 py-2.5 bg-[#F39C12] text-white rounded-full" style={{ fontWeight: 600 }}>Tạo voucher</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
