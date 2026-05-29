import { Flower2, Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#6C3483] text-[#FDF6E3] mt-20">
      <div
        className="h-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #C0392B 0 20px, #F39C12 20px 40px, #1E8449 40px 60px, #6C3483 60px 80px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center">
              <Flower2 className="w-6 h-6 text-[#F39C12]" />
            </div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700 }}>
              Đặc Sản Miền Trung
            </div>
          </div>
          <p className="text-sm text-white/80 mb-4">
            Gìn giữ và lan tỏa tinh hoa ẩm thực 19 tỉnh miền Trung Việt Nam đến mọi nhà.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#F39C12] flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-[#F39C12]" style={{ fontWeight: 600 }}>Về chúng tôi</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="#" className="hover:text-[#F39C12]">Câu chuyện thương hiệu</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Cam kết chất lượng</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Đi & Viết — Blog</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Tuyển dụng</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[#F39C12]" style={{ fontWeight: 600 }}>Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="#" className="hover:text-[#F39C12]">Chính sách giao hàng</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Đổi trả & hoàn tiền</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Theo dõi đơn hàng</a></li>
            <li><a href="#" className="hover:text-[#F39C12]">Câu hỏi thường gặp</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[#F39C12]" style={{ fontWeight: 600 }}>Liên hệ</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> 128 Trần Phú, Đà Nẵng</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 shrink-0 mt-0.5" /> 0935 122 618</li>
            <li className="flex gap-2"><Mail className="w-4 h-4 shrink-0 mt-0.5" /> hello@dacsanmientrung.vn</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <div>© 2026 DacSanMienTrung.vn — Mang hương vị quê nhà đến muôn nơi.</div>
          <div className="flex items-center gap-2">
            <span>Thanh toán:</span>
            {["VISA", "MC", "MOMO", "VNPAY", "COD"].map((m) => (
              <span key={m} className="px-2 py-1 bg-white/10 rounded">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
