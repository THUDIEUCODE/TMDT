import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ProductCard } from "../components/ProductCard";
import { products } from "../components/data";
import { Star, Minus, Plus, ShieldCheck, Truck, RotateCcw, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "../components/router";

export function ProductDetailPage() {
  const { navigate } = useRouter();
  const p = products[2];
  const [tab, setTab] = useState("desc");
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState("500g");
  const [pack, setPack] = useState("Hộp");

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Đặc Sản Khô", screen: "category" }, { label: p.name }]} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-2xl bg-white overflow-hidden mb-4 shadow">
            <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {products.slice(0, 4).map((t, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl bg-white overflow-hidden cursor-pointer border-2 ${
                  i === 0 ? "border-[#C0392B]" : "border-transparent"
                }`}
              >
                <ImageWithFallback src={t.image} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#6C3483] text-white text-xs mb-3">
            📍 Xuất xứ: {p.province}
          </span>
          <h1 className="mb-3" style={{ fontFamily: "Playfair Display, serif", fontSize: "32px", fontWeight: 700 }}>
            {p.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">{p.rating}/5 · {p.reviews} đánh giá · Đã bán 1.2K</span>
          </div>

          <div className="bg-[#FDF6E3] rounded-2xl p-5 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-[#C0392B]" style={{ fontSize: "36px", fontWeight: 700 }}>
                {p.price.toLocaleString("vi-VN")}₫
              </span>
              <span className="text-gray-400 line-through">135.000₫</span>
              <span className="px-2 py-1 bg-[#C0392B] text-white text-xs rounded">-30%</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm mb-2" style={{ fontWeight: 600 }}>Khối lượng:</div>
            <div className="flex gap-2">
              {["200g", "500g", "1kg"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    variant === v ? "border-[#C0392B] bg-[#FDF6E3] text-[#C0392B]" : "border-gray-200 bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm mb-2" style={{ fontWeight: 600 }}>Đóng gói:</div>
            <div className="flex gap-2">
              {["Hộp", "Túi zip", "Lọ thủy tinh"].map((v) => (
                <button
                  key={v}
                  onClick={() => setPack(v)}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    pack === v ? "border-[#C0392B] bg-[#FDF6E3] text-[#C0392B]" : "border-gray-200 bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-sm mb-2" style={{ fontWeight: 600 }}>Số lượng:</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center" style={{ fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => navigate("cart")}
              className="flex-1 py-3 border-2 border-[#C0392B] text-[#C0392B] rounded-full hover:bg-[#C0392B] hover:text-white flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
            </button>
            <button
              onClick={() => navigate("checkout-address")}
              className="flex-1 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226]"
              style={{ fontWeight: 600 }}
            >
              Mua Ngay
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: ShieldCheck, label: "Đảm bảo chất lượng" },
              { Icon: Truck, label: "Ship toàn quốc" },
              { Icon: RotateCcw, label: "Đổi trả 7 ngày" },
            ].map(({ Icon, label }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center">
                <Icon className="w-6 h-6 text-[#1E8449] mx-auto mb-1" />
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex gap-2 border-b mb-5">
            {[
              { id: "desc", label: "Mô tả" },
              { id: "reviews", label: "Đánh giá (215)" },
              { id: "related", label: "Sản phẩm liên quan" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 -mb-px border-b-2 ${
                  tab === t.id ? "border-[#C0392B] text-[#C0392B]" : "border-transparent text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "desc" && (
            <div className="prose max-w-none text-gray-700 space-y-3">
              <p>
                Mắm ruốc Dì Cẩn là thương hiệu đặc sản Đà Nẵng nổi tiếng hơn 40 năm qua, được làm hoàn toàn thủ công
                từ ruốc biển tươi và muối hột biển miền Trung.
              </p>
              <p><strong>Thành phần:</strong> Ruốc biển 70%, muối hột, ớt, tỏi, đường, gia vị gia truyền.</p>
              <p><strong>Bảo quản:</strong> Nơi khô ráo, thoáng mát. Sau khi mở nắp nên bảo quản trong ngăn mát tủ lạnh.</p>
              <p><strong>Câu chuyện:</strong> Hơn 4 thập kỷ trước, bà Cẩn bắt đầu nghề làm mắm ruốc bên bờ sông Hàn. Công thức gia truyền được giữ nguyên vẹn đến nay — từng hũ mắm đều được kiểm định thủ công.</p>
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              {[
                { name: "Nguyễn Minh", rating: 5, content: "Vị mắm đậm đà đúng kiểu quê nội. Ship nhanh, hũ nguyên vẹn!" },
                { name: "Trần Hoa", rating: 5, content: "Mua biếu bố mẹ ngoài Bắc, ai cũng khen ngon!" },
                { name: "Lê Tuấn", rating: 4, content: "Chất lượng tốt, mong có combo giá ưu đãi." },
              ].map((r, i) => (
                <div key={i} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#C0392B] text-white flex items-center justify-center text-xs">
                      {r.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < r.rating ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-[#1E8449]">✓ Đã mua hàng</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "related" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.slice(0, 4).map((rp) => <ProductCard key={rp.id} product={rp} />)}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
