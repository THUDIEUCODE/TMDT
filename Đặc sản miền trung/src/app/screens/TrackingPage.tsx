import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { Check, Package, Truck, Home, ClipboardList } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";

export function TrackingPage() {
  const steps = [
    { Icon: ClipboardList, label: "Đặt hàng", time: "25/04 09:15", done: true },
    { Icon: Check, label: "Xác nhận", time: "25/04 10:30", done: true },
    { Icon: Package, label: "Đóng gói", time: "Đang thực hiện", done: true, current: true },
    { Icon: Truck, label: "Đang giao", time: "Dự kiến 27/04", done: false },
    { Icon: Home, label: "Đã nhận", time: "Dự kiến 29/04", done: false },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Tài khoản", screen: "account" }, { label: "Theo dõi đơn hàng" }]} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex flex-wrap justify-between gap-4 mb-6">
            <div>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}>
                Đơn hàng #DM2026042501
              </h1>
              <div className="text-sm text-gray-500">Đặt ngày 25/04/2026</div>
            </div>
            <span className="px-4 py-2 bg-[#2874A6] text-white rounded-full text-sm h-fit">Đang xử lý</span>
          </div>

          <div className="relative">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200" />
            <div className="absolute top-6 left-6 h-0.5 bg-[#1E8449]" style={{ width: "calc(50% - 24px)" }} />
            <div className="relative grid grid-cols-5 gap-2">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow ${
                      s.current
                        ? "bg-[#F39C12] text-white animate-pulse"
                        : s.done
                        ? "bg-[#1E8449] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <s.Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs mt-2" style={{ fontWeight: 600 }}>{s.label}</div>
                  <div className="text-[10px] text-gray-500">{s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="mb-3" style={{ fontWeight: 600 }}>Thông tin vận chuyển</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Đơn vị</span><span>Giao Hàng Nhanh (GHN)</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Mã vận đơn</span><span className="text-[#C0392B]">GHN2026045821</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Phương thức</span><span>Tiêu chuẩn 3-5 ngày</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="mb-3" style={{ fontWeight: 600 }}>Địa chỉ nhận hàng</h3>
            <div className="text-sm space-y-1 text-gray-700">
              <div style={{ fontWeight: 600 }}>Nguyễn Văn An · 0901 234 567</div>
              <div>128 Trần Phú, P. Hải Châu, Q. Hải Châu, TP. Đà Nẵng</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h3 className="mb-4" style={{ fontWeight: 600 }}>Sản phẩm đã đặt</h3>
          <div className="space-y-3">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                <div className="w-16 h-16 rounded-lg bg-[#FDF6E3] overflow-hidden">
                  <ImageWithFallback src={p.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">x1 · 500g / Hộp</div>
                </div>
                <div className="text-[#C0392B]" style={{ fontWeight: 600 }}>{p.price.toLocaleString("vi-VN")}₫</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
