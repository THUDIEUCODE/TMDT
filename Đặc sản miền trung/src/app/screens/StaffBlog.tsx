import { StaffLayout } from "./StaffLayout";
import { Plus, Edit, Trash2, Eye, X, Search } from "lucide-react";
import { useState } from "react";

const posts = [
  { id: 1, title: "Bí mật món Mắm Tôm Chua Huế — Vị xưa giữa lòng phố thị", author: "Minh Trang", date: "22/04/2026", province: "Huế", status: "published", views: 2840, emoji: "🦐", color: "#6C3483" },
  { id: 2, title: "Đà Nẵng & nghệ thuật bánh tráng cuốn thịt heo", author: "Hoàng Nam", date: "18/04/2026", province: "Đà Nẵng", status: "published", views: 1920, emoji: "🥟", color: "#C0392B" },
  { id: 3, title: "Hương quế Trà My — Ngàn năm lưu truyền", author: "Thu Hà", date: "12/04/2026", province: "Quảng Nam", status: "published", views: 1240, emoji: "🌿", color: "#1E8449" },
  { id: 4, title: "Rượu Bàu Đá — Tinh hoa đất võ trời văn", author: "Văn Đức", date: "08/04/2026", province: "Bình Định", status: "draft", views: 0, emoji: "🍶", color: "#F39C12" },
  { id: 5, title: "Yến sào Khánh Hòa — Ngọc trời giữa đại dương", author: "Lan Anh", date: "01/04/2026", province: "Khánh Hòa", status: "published", views: 1680, emoji: "🪹", color: "#16A085" },
  { id: 6, title: "Cá ngừ đại dương Phú Yên — Vị biển trong từng miếng", author: "Hải Đăng", date: "28/03/2026", province: "Phú Yên", status: "review", views: 0, emoji: "🐟", color: "#2874A6" },
];

export function StaffBlog() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);

  const stats = [
    { label: "Tổng bài viết", value: posts.length, color: "#6C3483" },
    { label: "Đã xuất bản", value: posts.filter(p => p.status === "published").length, color: "#1E8449" },
    { label: "Bản nháp", value: posts.filter(p => p.status === "draft").length, color: "#F39C12" },
    { label: "Tổng lượt xem", value: posts.reduce((s, p) => s + p.views, 0).toLocaleString("vi-VN"), color: "#C0392B" },
  ];

  return (
    <StaffLayout title="Quản lý Blog — Đi & Viết">
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
          <input placeholder="Tìm bài viết..." className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg outline-none" />
        </div>
        <div className="flex gap-1">
          {[
            { id: "all", label: "Tất cả" },
            { id: "published", label: "Đã xuất bản" },
            { id: "draft", label: "Nháp" },
            { id: "review", label: "Chờ duyệt" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2 rounded-lg text-sm ${
                filter === f.id ? "bg-[#1E8449] text-white" : "bg-[#FDF6E3] hover:bg-[#FDF6E3]/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm flex items-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Viết bài mới
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl overflow-hidden">
            <div className="relative aspect-video flex items-center justify-center text-[80px]" style={{ backgroundColor: p.color }}>
              {p.emoji}
              <div className="absolute top-3 right-3">
                {p.status === "published" && <span className="px-2 py-1 bg-[#1E8449] text-white text-xs rounded-full">Đã xuất bản</span>}
                {p.status === "draft" && <span className="px-2 py-1 bg-[#F39C12] text-white text-xs rounded-full">Nháp</span>}
                {p.status === "review" && <span className="px-2 py-1 bg-[#6C3483] text-white text-xs rounded-full">Chờ duyệt</span>}
              </div>
            </div>
            <div className="p-4">
              <span className="inline-block px-2 py-0.5 rounded text-white text-xs mb-2" style={{ backgroundColor: p.color }}>
                📍 {p.province}
              </span>
              <h3 className="line-clamp-2 mb-2" style={{ fontFamily: "Playfair Display, serif", fontWeight: 700 }}>
                {p.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>✍️ {p.author}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views.toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-[#FDF6E3] text-[#C0392B] rounded-full text-xs flex items-center justify-center gap-1">
                  <Edit className="w-3 h-3" /> Sửa
                </button>
                <button className="px-3 py-1.5 bg-[#FDF6E3] hover:bg-[#C0392B] hover:text-white rounded-full text-xs">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>Viết bài mới</h2>
              <button onClick={() => setOpen(false)}><X /></button>
            </div>
            <div className="space-y-4 text-sm">
              <input placeholder="Tiêu đề bài viết" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none text-lg" />
              <div className="grid grid-cols-3 gap-3">
                <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg"><option>Chọn tỉnh</option><option>Huế</option><option>Đà Nẵng</option></select>
                <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg"><option>Chủ đề</option><option>Ẩm thực</option><option>Văn hóa</option></select>
                <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg"><option>Lưu nháp</option><option>Xuất bản</option></select>
              </div>
              <input placeholder="Mô tả ngắn..." className="w-full px-4 py-2 bg-[#FDF6E3] rounded-xl outline-none" />
              <textarea rows={8} placeholder="Nội dung bài viết (hỗ trợ Markdown)..." className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none resize-none" />
              <div className="border-2 border-dashed border-[#C0392B] rounded-xl p-6 text-center text-sm text-gray-500">
                Kéo thả ảnh bìa vào đây
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setOpen(false)} className="px-6 py-2.5 border rounded-full">Hủy</button>
                <button className="px-6 py-2.5 bg-[#C0392B] text-white rounded-full" style={{ fontWeight: 600 }}>Xuất bản</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
