import { StaffLayout } from "./StaffLayout";
import { Plus, Lock, Unlock, Edit, Search, Mail, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

const users = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@email.com", phone: "0901 234 567", role: "Khách hàng", color: "#2874A6", active: true, orders: 12, spent: 3250000, joined: "12/01/2026" },
  { id: 2, name: "Lê Hoàng Admin", email: "admin@dacsanmt.vn", phone: "0988 111 222", role: "QTV", color: "#6C3483", active: true, orders: 0, spent: 0, joined: "01/01/2026" },
  { id: 3, name: "Trần Lan Anh", email: "lananh@dacsanmt.vn", phone: "0912 345 678", role: "Nhân viên", color: "#1E8449", active: true, orders: 0, spent: 0, joined: "15/01/2026" },
  { id: 4, name: "Phạm Minh Tuấn", email: "tuan.pham@email.com", phone: "0934 567 890", role: "Khách hàng", color: "#2874A6", active: false, orders: 3, spent: 485000, joined: "22/02/2026" },
  { id: 5, name: "Vũ Thị Hoa", email: "hoa.vu@dacsanmt.vn", phone: "0945 678 901", role: "Nhân viên", color: "#1E8449", active: true, orders: 0, spent: 0, joined: "18/02/2026" },
  { id: 6, name: "Đỗ Minh Thư", email: "minhthu@email.com", phone: "0956 789 012", role: "Khách hàng", color: "#2874A6", active: true, orders: 24, spent: 5680000, joined: "05/02/2026" },
  { id: 7, name: "Võ Hoàng Nam", email: "nam.vo@email.com", phone: "0967 890 123", role: "Khách hàng", color: "#2874A6", active: true, orders: 8, spent: 1920000, joined: "10/03/2026" },
  { id: 8, name: "Bùi Thu Hà", email: "thuha@dacsanmt.vn", phone: "0978 901 234", role: "Nhân viên", color: "#1E8449", active: true, orders: 0, spent: 0, joined: "01/03/2026" },
];

export function AdminAccounts() {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = filter === "all" ? users : users.filter(u => {
    if (filter === "customer") return u.role === "Khách hàng";
    if (filter === "staff") return u.role === "Nhân viên";
    if (filter === "admin") return u.role === "QTV";
    if (filter === "locked") return !u.active;
    return true;
  });

  const stats = [
    { label: "Tổng tài khoản", value: users.length, color: "#6C3483" },
    { label: "Khách hàng", value: users.filter(u => u.role === "Khách hàng").length, color: "#2874A6" },
    { label: "Nhân viên", value: users.filter(u => u.role === "Nhân viên").length, color: "#1E8449" },
    { label: "Đã khóa", value: users.filter(u => !u.active).length, color: "#C0392B" },
  ];

  return (
    <StaffLayout title="Quản lý tài khoản" isAdmin>
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

      <div className="bg-white rounded-2xl p-5 mb-4 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Tìm theo tên, email, SĐT..." className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg outline-none" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            { id: "all", label: "Tất cả" },
            { id: "customer", label: "Khách hàng" },
            { id: "staff", label: "Nhân viên" },
            { id: "admin", label: "QTV" },
            { id: "locked", label: "Đã khóa" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-lg text-sm ${
                filter === f.id ? "bg-[#6C3483] text-white" : "bg-[#FDF6E3] hover:bg-[#FDF6E3]/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#1E8449] text-white rounded-lg text-sm flex items-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Tạo tài khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FDF6E3]">
            <tr className="text-left">
              <th className="px-5 py-3">Thông tin</th>
              <th className="px-5 py-3">Liên hệ</th>
              <th className="px-5 py-3">Vai trò</th>
              <th className="px-5 py-3">Đơn hàng</th>
              <th className="px-5 py-3">Chi tiêu</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C0392B] to-[#6C3483] text-white flex items-center justify-center" style={{ fontWeight: 700 }}>
                      {u.name.split(" ").pop()![0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="text-xs text-gray-500">Tham gia {u.joined}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5"><Mail className="w-3 h-3" /> {u.email}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-600"><Phone className="w-3 h-3" /> {u.phone}</div>
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: u.color }}>{u.role}</span>
                </td>
                <td className="px-5 py-3">{u.orders}</td>
                <td className="px-5 py-3" style={{ fontWeight: 600 }}>
                  {u.spent > 0 ? `${(u.spent / 1000000).toFixed(2)}M₫` : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-white text-xs ${u.active ? "bg-[#1E8449]" : "bg-gray-400"}`}>
                    {u.active ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#2874A6]" title="Sửa"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#F39C12]" title={u.active ? "Khóa" : "Mở khóa"}>
                      {u.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button className="p-1.5 hover:bg-[#FDF6E3] rounded text-[#C0392B]" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
              Tạo tài khoản mới
            </h2>
            <div className="space-y-3 text-sm">
              <input placeholder="Họ và tên" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
              <input placeholder="Email" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
              <input placeholder="Số điện thoại" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
              <input type="password" placeholder="Mật khẩu tạm" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" />
              <select className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg">
                <option>Khách hàng</option>
                <option>Nhân viên</option>
                <option>Quản trị viên</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border rounded-full">Hủy</button>
                <button className="flex-1 py-2.5 bg-[#1E8449] text-white rounded-full" style={{ fontWeight: 600 }}>Tạo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
