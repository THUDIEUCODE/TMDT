import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { products } from "../components/data";
import { Breadcrumb } from "./Breadcrumb";
import { Star } from "lucide-react";
import { useState } from "react";

export function CategoryPage() {
  const [tab, setTab] = useState("all");
  const all = [...products, ...products].slice(0, 12).map((p, i) => ({ ...p, id: `${p.id}-${i}` }));
  const provinces = ["Huế", "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa"];
  const subTabs = [
    { id: "all", label: "Tất cả" },
    { id: "cake", label: "Bánh" },
    { id: "candy", label: "Kẹo" },
    { id: "jam", label: "Mứt" },
    { id: "rice", label: "Bánh tráng" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Bánh Kẹo" }]} />

      <div className="relative h-56 bg-gradient-to-r from-[#C0392B] to-[#F39C12] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, #fff 2px, transparent 2px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative text-center text-white">
          <div className="text-5xl mb-2">🍬</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "40px", fontWeight: 700 }}>
            Bánh Kẹo Miền Trung
          </h1>
          <p className="text-white/90 mt-2">Hương vị truyền thống từ 19 tỉnh đất thánh</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-5">
            <h3 className="mb-3 text-[#6C3483]" style={{ fontWeight: 600 }}>Tỉnh / Thành</h3>
            <div className="space-y-2">
              {provinces.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#C0392B]">
                  <input type="checkbox" className="accent-[#C0392B]" />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="mb-3 text-[#6C3483]" style={{ fontWeight: 600 }}>Khoảng giá</h3>
            <input type="range" className="w-full accent-[#C0392B]" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0₫</span>
              <span>2.000.000₫</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="mb-3 text-[#6C3483]" style={{ fontWeight: 600 }}>Đánh giá</h3>
            {[5, 4, 3].map((n) => (
              <label key={n} className="flex items-center gap-2 cursor-pointer mb-1">
                <input type="checkbox" className="accent-[#C0392B]" />
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < n ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">trở lên</span>
              </label>
            ))}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {subTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    tab === t.id ? "bg-[#C0392B] text-white" : "bg-white text-gray-700 hover:bg-[#FDF6E3]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <select className="px-4 py-2 rounded-full bg-white border border-[#FDF6E3] text-sm">
              <option>Mới nhất</option>
              <option>Bán chạy</option>
              <option>Giá thấp → cao</option>
              <option>Giá cao → thấp</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {all.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="flex justify-center gap-2 mt-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`w-10 h-10 rounded-full ${n === 1 ? "bg-[#C0392B] text-white" : "bg-white hover:bg-[#FDF6E3]"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
