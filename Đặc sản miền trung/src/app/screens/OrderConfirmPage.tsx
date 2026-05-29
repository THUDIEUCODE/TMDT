import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "../components/router";

export function OrderConfirmPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-10 text-center shadow">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-[#1E8449]/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-[#1E8449] flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="mb-2" style={{ fontFamily: "Playfair Display, serif", fontSize: "32px", fontWeight: 700, color: "#1E8449" }}>
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã tin tưởng Đặc Sản Miền Trung. Đơn hàng đang được xử lý.
          </p>

          <div className="bg-[#FDF6E3] rounded-2xl p-5 mb-6 text-left">
            <div className="flex justify-between py-2 border-b border-white">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span style={{ fontWeight: 700, color: "#C0392B" }}>#DM2026042501</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white">
              <span className="text-gray-600">Tổng tiền</span>
              <span style={{ fontWeight: 700 }}>325.000₫</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white">
              <span className="text-gray-600">Phương thức</span>
              <span>COD</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Dự kiến giao</span>
              <span className="text-[#1E8449]" style={{ fontWeight: 600 }}>28 - 30/04/2026</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("tracking")}
              className="px-6 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226]"
              style={{ fontWeight: 600 }}
            >
              Theo dõi đơn hàng
            </button>
            <button
              onClick={() => navigate("home")}
              className="px-6 py-3 border-2 border-[#C0392B] text-[#C0392B] rounded-full hover:bg-[#FDF6E3]"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
