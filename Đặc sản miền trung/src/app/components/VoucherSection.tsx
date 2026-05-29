import { Copy, Clock } from "lucide-react";
import { useState } from "react";

const vouchers = [
  {
    code: "TETSUM2026",
    discount: "30%",
    desc: "Giảm 30% cho combo quà Tết",
    min: "Đơn từ 500.000₫",
    expire: "31/01/2026",
    bg: "from-[#C0392B] to-[#6C3483]",
  },
  {
    code: "MIENTRUNG50",
    discount: "50K",
    desc: "Giảm 50.000₫ cho khách hàng mới",
    min: "Đơn từ 200.000₫",
    expire: "Còn 3 ngày",
    bg: "from-[#1E8449] to-[#F39C12]",
    urgent: true,
  },
];

export function VoucherSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {vouchers.map((v) => (
        <div
          key={v.code}
          className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${v.bg} p-6 text-white shadow-lg`}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 15px)",
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-[#F39C12] mb-1" style={{ fontSize: "14px" }}>
                VOUCHER ƯU ĐÃI
              </div>
              <div style={{ fontSize: "42px", fontWeight: 700, fontFamily: "Playfair Display, serif" }}>
                -{v.discount}
              </div>
              <div className="text-white/90 mb-2">{v.desc}</div>
              <div className="text-xs text-white/70 mb-3">{v.min}</div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3" />
                <span className={v.urgent ? "text-[#F39C12]" : ""}>{v.expire}</span>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-white/40 pl-4">
              <div className="text-xs text-white/80 mb-1">MÃ GIẢM</div>
              <div className="bg-white/20 rounded-lg px-3 py-2 mb-2" style={{ fontWeight: 700, letterSpacing: "1px" }}>
                {v.code}
              </div>
              <button
                onClick={() => copy(v.code)}
                className="w-full px-3 py-1.5 bg-white text-[#C0392B] rounded-full text-xs flex items-center justify-center gap-1 hover:bg-[#F39C12] hover:text-white transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied === v.code ? "Đã sao chép!" : "Sao chép"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
