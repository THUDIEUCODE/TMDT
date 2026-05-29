import { Flower2 } from "lucide-react";
import { useRouter } from "../components/router";

function AuthShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { navigate } = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C0392B] via-[#6C3483] to-[#1E8449] flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, #fff 2px, transparent 2px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <button onClick={() => navigate("home")} className="flex items-center gap-2 justify-center mb-6 w-full">
          <div className="w-12 h-12 rounded-full bg-[#C0392B] flex items-center justify-center">
            <Flower2 className="w-7 h-7 text-[#F39C12]" />
          </div>
          <div className="text-[#C0392B]" style={{ fontFamily: "Playfair Display, serif", fontSize: "20px", fontWeight: 700 }}>
            Đặc Sản Miền Trung
          </div>
        </button>
        <h1 className="text-center mb-6" style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700 }}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { navigate } = useRouter();
  return (
    <AuthShell title="Đăng nhập">
      <div className="space-y-4">
        <input placeholder="Email hoặc số điện thoại" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <input type="password" placeholder="Mật khẩu" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#C0392B]" /> Ghi nhớ</label>
          <a href="#" className="text-[#C0392B]">Quên mật khẩu?</a>
        </div>
        <button
          onClick={() => navigate("account")}
          className="w-full py-3 bg-[#C0392B] text-white rounded-xl hover:bg-[#a93226]"
          style={{ fontWeight: 600 }}
        >
          Đăng nhập
        </button>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" /> hoặc <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button className="w-full py-3 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500" />
          Đăng nhập với Google
        </button>
        <div className="text-center text-sm">
          Chưa có tài khoản? <button onClick={() => navigate("register")} className="text-[#C0392B]" style={{ fontWeight: 600 }}>Đăng ký ngay</button>
        </div>
      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { navigate } = useRouter();
  return (
    <AuthShell title="Đăng ký">
      <div className="space-y-3">
        <input placeholder="Họ và tên" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <input placeholder="Email" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input type="password" placeholder="Mật khẩu" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
          <input type="password" placeholder="Xác nhận" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        </div>
        <input placeholder="Số điện thoại" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <input type="date" className="w-full px-4 py-3 bg-[#FDF6E3] rounded-xl outline-none" />
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input type="checkbox" className="mt-1 accent-[#C0392B]" />
          Tôi đồng ý với <a href="#" className="text-[#C0392B]">Điều khoản & Chính sách bảo mật</a>
        </label>
        <button
          onClick={() => navigate("account")}
          className="w-full py-3 bg-[#C0392B] text-white rounded-xl hover:bg-[#a93226]"
          style={{ fontWeight: 600 }}
        >
          Đăng ký
        </button>
        <div className="text-center text-sm">
          Đã có tài khoản? <button onClick={() => navigate("login")} className="text-[#C0392B]" style={{ fontWeight: 600 }}>Đăng nhập</button>
        </div>
      </div>
    </AuthShell>
  );
}
