import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CheckoutSteps, OrderSummary } from "./CheckoutSteps";
import { useRouter } from "../components/router";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CheckoutAddressPage() {
  const { navigate } = useRouter();
  const [addr, setAddr] = useState("1");
  const [ship, setShip] = useState("std");

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <CheckoutSteps current={1} />

      <div className="max-w-5xl mx-auto px-6 pb-16 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-3">
              {[
                { id: "1", name: "Nguyễn Văn An", phone: "0901 234 567", addr: "128 Trần Phú, P. Hải Châu, Đà Nẵng", default: true },
                { id: "2", name: "Nguyễn Văn An", phone: "0901 234 567", addr: "45 Lý Thường Kiệt, Q1, TP.HCM" },
              ].map((a) => (
                <label
                  key={a.id}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                    addr === a.id ? "border-[#C0392B] bg-[#FDF6E3]" : "border-gray-200"
                  }`}
                >
                  <input type="radio" checked={addr === a.id} onChange={() => setAddr(a.id)} className="mt-1 accent-[#C0392B]" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-sm text-gray-600">{a.phone}</span>
                      {a.default && <span className="px-2 py-0.5 bg-[#1E8449] text-white text-xs rounded-full">Mặc định</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{a.addr}</div>
                  </div>
                </label>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-[#C0392B] text-[#C0392B] rounded-xl flex items-center justify-center gap-2 hover:bg-[#FDF6E3]">
                <Plus className="w-4 h-4" /> Thêm địa chỉ mới
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
              Phương thức vận chuyển
            </h2>
            {[
              { id: "std", label: "Tiêu chuẩn (3-5 ngày)", price: "30.000₫" },
              { id: "exp", label: "Express (1-2 ngày)", price: "60.000₫" },
            ].map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer mb-2 ${
                  ship === s.id ? "border-[#C0392B] bg-[#FDF6E3]" : "border-gray-200"
                }`}
              >
                <input type="radio" checked={ship === s.id} onChange={() => setShip(s.id)} className="accent-[#C0392B]" />
                <div className="flex-1">{s.label}</div>
                <div style={{ fontWeight: 600 }}>{s.price}</div>
              </label>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={() => navigate("cart")} className="px-6 py-3 text-gray-600">← Quay lại giỏ hàng</button>
            <button
              onClick={() => navigate("checkout-payment")}
              className="px-8 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226]"
              style={{ fontWeight: 600 }}
            >
              Tiếp tục →
            </button>
          </div>
        </div>

        <OrderSummary />
      </div>

      <Footer />
    </div>
  );
}
