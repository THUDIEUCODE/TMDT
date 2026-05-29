import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { Trash2, Minus, Plus, Tag } from "lucide-react";
import { useRouter } from "../components/router";

export function CartPage() {
  const { navigate } = useRouter();
  const items = products.slice(0, 3);
  const subtotal = items.reduce((s, p) => s + p.price, 0);
  const shipping = 30000;
  const discount = 50000;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Giỏ Hàng" }]} />

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-[#FDF6E3] px-6 py-3 grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 text-sm" style={{ fontWeight: 600 }}>
            <div>Sản phẩm</div>
            <div className="text-center">Đơn giá</div>
            <div className="text-center">Số lượng</div>
            <div className="text-center">Thành tiền</div>
            <div />
          </div>

          {items.map((p) => (
            <div key={p.id} className="px-6 py-4 grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 items-center border-b">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-[#FDF6E3] overflow-hidden">
                  <ImageWithFallback src={p.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="line-clamp-2 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">500g / Hộp</div>
                </div>
              </div>
              <div className="text-center text-sm">{p.price.toLocaleString("vi-VN")}₫</div>
              <div className="flex items-center justify-center gap-2">
                <button className="w-7 h-7 rounded border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                <span className="w-8 text-center text-sm">1</span>
                <button className="w-7 h-7 rounded border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="text-center text-[#C0392B]" style={{ fontWeight: 600 }}>{p.price.toLocaleString("vi-VN")}₫</div>
              <button className="text-gray-400 hover:text-[#C0392B]"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 h-fit sticky top-28">
          <h3 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
            Tổng đơn hàng
          </h3>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input placeholder="Mã giảm giá" className="w-full pl-9 pr-3 py-2 bg-[#FDF6E3] rounded-lg text-sm outline-none" />
            </div>
            <button className="px-4 bg-[#F39C12] text-white rounded-lg text-sm">Áp dụng</button>
          </div>

          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{subtotal.toLocaleString("vi-VN")}₫</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{shipping.toLocaleString("vi-VN")}₫</span></div>
            <div className="flex justify-between text-[#1E8449]"><span>Giảm giá</span><span>-{discount.toLocaleString("vi-VN")}₫</span></div>
          </div>

          <div className="flex justify-between items-baseline mb-5">
            <span>Tổng cộng</span>
            <span className="text-[#C0392B]" style={{ fontSize: "24px", fontWeight: 700 }}>
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <button
            onClick={() => navigate("checkout-address")}
            className="w-full py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226] mb-2"
            style={{ fontWeight: 600 }}
          >
            Tiến hành đặt hàng
          </button>
          <button onClick={() => navigate("home")} className="w-full text-center text-sm text-[#6C3483] hover:underline">
            ← Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
