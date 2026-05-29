import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CheckoutSteps, OrderSummary } from "./CheckoutSteps";
import { useRouter } from "../components/router";
import { Banknote, Building, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";

export function CheckoutPaymentPage() {
  const { navigate } = useRouter();
  const [method, setMethod] = useState("cod");

  const methods = [
    { id: "cod", Icon: Banknote, label: "Tiền mặt (COD)", desc: "Thanh toán khi nhận hàng", color: "#1E8449" },
    { id: "bank", Icon: Building, label: "Chuyển khoản ngân hàng", desc: "Hỗ trợ Vietcombank, Techcombank...", color: "#2874A6" },
    { id: "card", Icon: CreditCard, label: "Thẻ tín dụng / ghi nợ", desc: "Visa, Mastercard, JCB", color: "#6C3483" },
    { id: "ewallet", Icon: Wallet, label: "Ví điện tử", desc: "MoMo, VNPay, ZaloPay", color: "#C0392B" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <CheckoutSteps current={2} />

      <div className="max-w-5xl mx-auto px-6 pb-16 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
              Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${
                    method === m.id ? "border-[#C0392B] bg-[#FDF6E3]" : "border-gray-200"
                  }`}
                >
                  <input type="radio" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#C0392B]" />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    <m.Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600 }}>{m.label}</div>
                    <div className="text-sm text-gray-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="mb-4" style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", fontWeight: 700 }}>
              Ghi chú đơn hàng
            </h2>
            <textarea
              rows={4}
              placeholder="Lưu ý cho shipper (vd: giao giờ hành chính, gọi trước khi giao...)"
              className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none resize-none"
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => navigate("checkout-address")} className="px-6 py-3 text-gray-600">← Quay lại</button>
            <button
              onClick={() => navigate("order-confirm")}
              className="px-8 py-3 bg-[#C0392B] text-white rounded-full hover:bg-[#a93226]"
              style={{ fontWeight: 600 }}
            >
              Xác nhận đặt hàng
            </button>
          </div>
        </div>

        <OrderSummary />
      </div>

      <Footer />
    </div>
  );
}
