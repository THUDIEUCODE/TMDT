import { Search, ShoppingCart, User, Phone, Flower2 } from "lucide-react";
import { useRouter } from "./router";

export function Header() {
  const { navigate } = useRouter();
  const navItems = [
    { label: "Trang Chủ", screen: "home" as const },
    { label: "Bánh Kẹo", screen: "category" as const },
    { label: "Đá Phong Thủy", screen: "category" as const },
    { label: "Trà", screen: "category" as const },
    { label: "Tinh Dầu", screen: "category" as const },
    { label: "Đặc Sản Khô", screen: "category" as const },
    { label: "Combo Quà", screen: "combo-builder" as const },
    { label: "Đi & Viết", screen: "blog" as const },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-[#C0392B] text-[#FDF6E3]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Hotline: 0935 122 618</span>
          </div>
          <div className="hidden md:block">🚚 Miễn phí vận chuyển đơn từ 500.000đ</div>
          <div className="italic hidden md:block">Đặc sản 19 tỉnh miền Trung</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <button onClick={() => navigate("home")} className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center">
            <Flower2 className="w-7 h-7 text-[#F39C12]" />
          </div>
          <div className="text-left">
            <div className="text-[#C0392B]" style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", fontWeight: 700 }}>
              Đặc Sản Miền Trung
            </div>
            <div className="text-xs text-[#6C3483] italic">DacSanMienTrung.vn</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-5">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.screen)}
              className="whitespace-nowrap hover:text-[#C0392B] text-gray-700 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#FDF6E3] rounded-full">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => navigate("cart")}
            className="relative p-2 hover:bg-[#FDF6E3] rounded-full"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-[#F39C12] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button
            onClick={() => navigate("login")}
            className="hidden md:flex items-center gap-2 px-4 py-2 border-2 border-[#C0392B] text-[#C0392B] rounded-full hover:bg-[#C0392B] hover:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            Đăng Nhập
          </button>
        </div>
      </div>
    </header>
  );
}
