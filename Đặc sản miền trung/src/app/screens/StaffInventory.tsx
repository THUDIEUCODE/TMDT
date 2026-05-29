import { StaffLayout } from "./StaffLayout";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { AlertTriangle, Plus, Minus, Package, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

type Row = (typeof products)[number] & { stock: number; sold: number; min: number };

const rows: Row[] = products.slice(0, 10).map((p, i) => ({
  ...p,
  stock: [3, 28, 5, 12, 45, 8, 62, 18, 4, 35][i],
  sold: [142, 328, 215, 96, 204, 58, 183, 72, 89, 267][i],
  min: 10,
}));

export function StaffInventory() {
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const filtered = rows.filter(r => {
    if (filter === "low") return r.stock > 0 && r.stock < r.min;
    if (filter === "out") return r.stock === 0;
    return true;
  });

  const low = rows.filter(r => r.stock > 0 && r.stock < r.min).length;
  const totalStock = rows.reduce((s, r) => s + r.stock, 0);

  return (
    <StaffLayout title="Quản lý tồn kho">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng tồn kho", value: totalStock, icon: Package, color: "#1E8449" },
          { label: "Sắp hết hàng", value: low, icon: AlertTriangle, color: "#F39C12" },
          { label: "Nhập kho tháng", value: 1250, icon: TrendingUp, color: "#2874A6" },
          { label: "Xuất kho tháng", value: 840, icon: TrendingDown, color: "#C0392B" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-600">{s.label}</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {low > 0 && (
        <div className="bg-gradient-to-r from-[#F39C12]/20 to-[#C0392B]/20 border-l-4 border-[#C0392B] rounded-xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C0392B]" />
          <div className="text-sm">
            <strong>{low} sản phẩm</strong> đang sắp hết hàng. Vui lòng nhập thêm hàng để tránh gián đoạn bán hàng.
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {[
          { id: "all" as const, label: "Tất cả sản phẩm" },
          { id: "low" as const, label: `Sắp hết hàng (${low})` },
          { id: "out" as const, label: "Hết hàng" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === f.id ? "bg-[#1E8449] text-white" : "bg-white hover:bg-[#FDF6E3]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FDF6E3]">
            <tr className="text-left">
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Tỉnh</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Đã bán</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Điều chỉnh</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const percent = Math.min((r.stock / 50) * 100, 100);
              const danger = r.stock < r.min;
              return (
                <tr key={r.id} className="border-b last:border-0 hover:bg-[#FDF6E3]/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FDF6E3] overflow-hidden shrink-0">
                        <ImageWithFallback src={r.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-sm">{r.name}</div>
                        <div className="text-xs text-gray-500">SKU-{r.id.padStart(4, "0")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#6C3483] text-white text-xs rounded-full">{r.province}</span>
                  </td>
                  <td className="px-4 py-3" style={{ fontWeight: 600 }}>{r.price.toLocaleString("vi-VN")}₫</td>
                  <td className="px-4 py-3 text-gray-600">{r.sold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={danger ? "text-[#C0392B]" : "text-[#1E8449]"} style={{ fontWeight: 700, fontSize: "16px" }}>
                        {r.stock}
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-16">
                        <div
                          className="h-full"
                          style={{ width: `${percent}%`, backgroundColor: danger ? "#C0392B" : "#1E8449" }}
                        />
                      </div>
                      {danger && <AlertTriangle className="w-3.5 h-3.5 text-[#C0392B]" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="w-8 h-8 bg-[#1E8449] text-white rounded flex items-center justify-center hover:bg-[#196f3d]" title="Nhập kho">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-[#C0392B] text-white rounded flex items-center justify-center hover:bg-[#a93226]" title="Xuất kho">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}
