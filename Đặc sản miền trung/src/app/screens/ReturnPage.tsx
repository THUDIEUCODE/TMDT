import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { Upload } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { useRouter } from "../components/router";

export function ReturnPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Tài khoản", screen: "account" }, { label: "Yêu cầu hoàn hàng" }]} />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        <div className="bg-white rounded-2xl p-6">
          <h1 className="mb-1" style={{ fontFamily: "Playfair Display, serif", fontSize: "26px", fontWeight: 700 }}>
            Gửi yêu cầu hoàn hàng
          </h1>
          <p className="text-sm text-gray-600">Đơn hàng #DM2026041205 · Đã giao ngày 08/04/2026</p>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="mb-3" style={{ fontWeight: 600 }}>Chọn sản phẩm muốn hoàn</h3>
          <div className="space-y-3">
            {products.slice(0, 2).map((p) => (
              <label key={p.id} className="flex items-center gap-4 p-3 border-2 rounded-xl cursor-pointer hover:border-[#C0392B]">
                <input type="checkbox" className="accent-[#C0392B]" />
                <div className="w-14 h-14 rounded-lg bg-[#FDF6E3] overflow-hidden">
                  <ImageWithFallback src={p.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">x1 · {p.price.toLocaleString("vi-VN")}₫</div>
                </div>
                <input type="number" defaultValue={1} min={1} className="w-16 px-2 py-1 bg-[#FDF6E3] rounded text-center" />
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="mb-3" style={{ fontWeight: 600 }}>Lý do hoàn hàng</h3>
          <select className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none mb-3">
            <option>Hàng lỗi / bị hỏng</option>
            <option>Không đúng mô tả</option>
            <option>Không muốn nữa</option>
            <option>Khác</option>
          </select>
          <textarea
            rows={4}
            placeholder="Mô tả chi tiết vấn đề gặp phải..."
            className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="mb-3" style={{ fontWeight: 600 }}>Hình ảnh minh chứng</h3>
          <label className="block border-2 border-dashed border-[#C0392B] rounded-xl p-8 text-center cursor-pointer hover:bg-[#FDF6E3]">
            <Upload className="w-10 h-10 text-[#C0392B] mx-auto mb-2" />
            <div className="text-sm text-gray-600">Kéo thả hoặc click để tải ảnh (tối đa 5 ảnh)</div>
            <input type="file" multiple className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate("account")} className="px-6 py-3 text-gray-600">Hủy</button>
          <button
            onClick={() => navigate("account")}
            className="px-8 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226]"
            style={{ fontWeight: 600 }}
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
