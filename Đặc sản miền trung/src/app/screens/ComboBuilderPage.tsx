import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { products } from "../components/data";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Plus, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "../components/router";

export function ComboBuilderPage() {
  const { navigate } = useRouter();
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");

  const themes = [
    { id: "tet", label: "Tết Nguyên Đán", emoji: "🧧", bg: "from-[#C0392B] to-[#F39C12]" },
    { id: "trungthu", label: "Trung Thu", emoji: "🥮", bg: "from-[#F39C12] to-[#6C3483]" },
    { id: "qua", label: "Quà Biếu", emoji: "🎁", bg: "from-[#6C3483] to-[#C0392B]" },
    { id: "vung", label: "Đặc sản vùng", emoji: "🏯", bg: "from-[#1E8449] to-[#F39C12]" },
  ];

  const selectedProducts = products.filter((p) => selected.includes(p.id));
  const total = selectedProducts.reduce((s, p) => s + p.price, 0);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Tạo Combo Quà Tặng" }]} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-center mb-2" style={{ fontFamily: "Playfair Display, serif", fontSize: "36px", fontWeight: 700 }}>
          Tự Tay Gói Tấm Lòng
        </h1>
        <p className="text-center text-gray-600 mb-8">Chọn chủ đề → Thêm sản phẩm → Đặt tên → Đặt hàng</p>

        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= n ? "bg-[#C0392B] text-white" : "bg-white text-gray-400"
                }`}
              >
                {step > n ? <Check className="w-5 h-5" /> : n}
              </div>
              {n < 4 && <div className={`w-16 h-0.5 ${step > n ? "bg-[#C0392B]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-center mb-6" style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}>
              Bước 1 — Chọn chủ đề combo
            </h2>
            <div className="grid md:grid-cols-4 gap-5 mb-8">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative rounded-3xl bg-gradient-to-br ${t.bg} p-8 text-white hover:-translate-y-1 transition-transform ${
                    theme === t.id ? "ring-4 ring-[#F39C12]" : ""
                  }`}
                >
                  <div className="text-[80px] mb-3">{t.emoji}</div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
                    {t.label}
                  </div>
                  {theme === t.id && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#C0392B] flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                disabled={!theme}
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226] disabled:opacity-40"
                style={{ fontWeight: 600 }}
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div>
              <h2 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}>
                Bước 2 — Chọn sản phẩm
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => {
                  const picked = selected.includes(p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl overflow-hidden">
                      <div className="aspect-square bg-[#FDF6E3]">
                        <ImageWithFallback src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="text-sm line-clamp-2 h-10 mb-1">{p.name}</div>
                        <div className="text-[#C0392B] mb-2" style={{ fontWeight: 700 }}>{p.price.toLocaleString("vi-VN")}₫</div>
                        <button
                          onClick={() => toggle(p.id)}
                          className={`w-full py-1.5 text-xs rounded-full flex items-center justify-center gap-1 ${
                            picked ? "bg-[#1E8449] text-white" : "bg-[#FDF6E3] text-[#C0392B]"
                          }`}
                        >
                          {picked ? <><Check className="w-3 h-3" /> Đã thêm</> : <><Plus className="w-3 h-3" /> Thêm vào combo</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="bg-white rounded-2xl p-5 h-fit sticky top-28">
              <h3 className="mb-3" style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700 }}>
                Combo của bạn ({selected.length})
              </h3>
              {selectedProducts.length === 0 && <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p>}
              <div className="space-y-2 mb-4">
                {selectedProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-[#FDF6E3] rounded-lg">
                    <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 text-xs line-clamp-1">{p.name}</div>
                    <button onClick={() => toggle(p.id)} className="text-[#C0392B]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-3 pt-3 border-t">
                <span>Tổng</span>
                <span className="text-[#C0392B]" style={{ fontWeight: 700 }}>{total.toLocaleString("vi-VN")}₫</span>
              </div>
              <button
                disabled={selected.length === 0}
                onClick={() => setStep(3)}
                className="w-full py-2.5 bg-[#C0392B] text-white rounded-full disabled:opacity-40"
                style={{ fontWeight: 600 }}
              >
                Tiếp tục →
              </button>
            </aside>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8">
            <h2 className="mb-5" style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}>
              Bước 3 — Đặt tên combo
            </h2>
            <label className="block mb-4">
              <span className="text-sm mb-1 block">Tên combo</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='vd: "Quà Tết Yêu Thương dành cho Mẹ"'
                className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none"
              />
            </label>
            <label className="block mb-5">
              <span className="text-sm mb-1 block">Ghi chú / lời chúc</span>
              <textarea
                rows={4}
                placeholder="Thêm lời chúc ý nghĩa để gửi kèm hộp quà..."
                className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none resize-none"
              />
            </label>
            <button
              onClick={() => setStep(4)}
              className="w-full py-3 bg-[#C0392B] text-white rounded-full"
              style={{ fontWeight: 600 }}
            >
              Tiếp tục →
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="mb-2" style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700 }}>
              Combo đã sẵn sàng!
            </h2>
            <p className="text-gray-600 mb-5">
              Combo "{name || "Combo của bạn"}" — {selected.length} sản phẩm — tổng {total.toLocaleString("vi-VN")}₫
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-3 border-2 border-[#C0392B] text-[#C0392B] rounded-full">Lưu combo</button>
              <button
                onClick={() => navigate("checkout-address")}
                className="px-6 py-3 bg-[#C0392B] text-white rounded-full"
                style={{ fontWeight: 600 }}
              >
                Đặt hàng ngay
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
