import { StaffLayout } from "./StaffLayout";
import { Edit, Trash2, Plus, Search, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { useState } from "react";

export function StaffProducts() {
  const [open, setOpen] = useState(false);
  const all = [...products, ...products].slice(0, 10).map((p, i) => ({ ...p, id: `${p.id}-${i}`, stock: Math.floor(Math.random() * 100) + 1 }));

  return (
    <StaffLayout title="Quản lý sản phẩm & tồn kho">
      <div className="bg-white rounded-2xl p-5 mb-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg outline-none" />
        </div>
        <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg text-sm">
          <option>Tất cả danh mục</option>
          <option>Bánh kẹo</option>
          <option>Tinh dầu</option>
          <option>Mắm / Đặc sản khô</option>
        </select>
        <select className="px-3 py-2 bg-[#FDF6E3] rounded-lg text-sm">
          <option>Tất cả tỉnh</option>
          <option>Huế</option>
          <option>Đà Nẵng</option>
          <option>Quảng Nam</option>
        </select>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-[#1E8449] text-white rounded-lg text-sm flex items-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FDF6E3]">
            <tr className="text-left">
              <th className="px-4 py-3">Hình</th>
              <th className="px-4 py-3">Tên sản phẩm</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Tỉnh</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {all.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-lg bg-[#FDF6E3] overflow-hidden">
                    <ImageWithFallback src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs"><div className="line-clamp-2">{p.name}</div></td>
                <td className="px-4 py-3 text-gray-600">Đặc sản</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-[#6C3483] text-white text-xs rounded-full">{p.province}</span></td>
                <td className="px-4 py-3" style={{ fontWeight: 600 }}>{p.price.toLocaleString("vi-VN")}₫</td>
                <td className="px-4 py-3">
                  <span className={p.stock < 10 ? "text-[#C0392B]" : "text-[#1E8449]"} style={{ fontWeight: 600 }}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-[#1E8449] rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform" />
                  </label>
                </td>
                <td className="px-4 py-3">
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

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div className="w-[600px] bg-white h-full p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>Thêm sản phẩm mới</h2>
              <button onClick={() => setOpen(false)}><X /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                    <Plus />
                  </div>
                ))}
              </div>

              <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Tên sản phẩm</span>
                <input className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" placeholder="vd: Mắm ruốc Dì Cẩn" /></label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Danh mục</span>
                  <select className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg"><option>Đặc sản khô</option><option>Bánh kẹo</option><option>Tinh dầu</option></select></label>
                <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Tỉnh / Thành</span>
                  <select className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg"><option>Huế</option><option>Đà Nẵng</option></select></label>
              </div>

              <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Thành phần</span>
                <textarea rows={2} className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg resize-none" /></label>

              <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Hướng dẫn bảo quản</span>
                <textarea rows={2} className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg resize-none" /></label>

              <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Đặc trưng văn hóa / lịch sử</span>
                <textarea rows={3} className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg resize-none" /></label>

              <label className="block"><span className="mb-1 block" style={{ fontWeight: 600 }}>Giá niêm yết (₫)</span>
                <input type="number" className="w-full px-3 py-2 bg-[#FDF6E3] rounded-lg" /></label>

              <div className="border rounded-xl p-3">
                <div className="flex justify-between mb-2"><span style={{ fontWeight: 600 }}>Biến thể</span>
                  <button className="text-xs text-[#C0392B] flex items-center gap-1"><Plus className="w-3 h-3" /> Thêm</button></div>
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Khối lượng" className="px-2 py-1 bg-[#FDF6E3] rounded text-xs" defaultValue="200g" />
                  <input placeholder="Đóng gói" className="px-2 py-1 bg-[#FDF6E3] rounded text-xs" defaultValue="Hộp" />
                  <input type="number" placeholder="Giá" className="px-2 py-1 bg-[#FDF6E3] rounded text-xs" />
                </div>
              </div>

              <button className="w-full py-3 bg-[#1E8449] text-white rounded-full" style={{ fontWeight: 600 }}>Lưu sản phẩm</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
