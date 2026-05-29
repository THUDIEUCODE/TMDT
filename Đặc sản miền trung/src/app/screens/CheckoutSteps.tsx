import { Check } from "lucide-react";

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Địa chỉ" },
    { id: 2, label: "Thanh toán" },
    { id: 3, label: "Xác nhận" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  s.id < current
                    ? "bg-[#1E8449] border-[#1E8449] text-white"
                    : s.id === current
                    ? "bg-[#C0392B] border-[#C0392B] text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {s.id < current ? <Check className="w-5 h-5" /> : s.id}
              </div>
              <div className={`text-xs mt-1 ${s.id === current ? "text-[#C0392B]" : "text-gray-500"}`}>
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${s.id < current ? "bg-[#1E8449]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderSummary() {
  return (
    <div className="bg-white rounded-2xl p-5 text-sm">
      <h3 className="mb-3" style={{ fontWeight: 600 }}>Đơn hàng của bạn</h3>
      <div className="space-y-2 text-gray-600">
        <div className="flex justify-between"><span>3 sản phẩm</span><span>345.000₫</span></div>
        <div className="flex justify-between"><span>Vận chuyển</span><span>30.000₫</span></div>
        <div className="flex justify-between text-[#1E8449]"><span>Giảm giá</span><span>-50.000₫</span></div>
      </div>
      <div className="border-t mt-3 pt-3 flex justify-between">
        <span>Tổng</span>
        <span className="text-[#C0392B]" style={{ fontWeight: 700 }}>325.000₫</span>
      </div>
    </div>
  );
}
