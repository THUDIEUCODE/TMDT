import { useState } from "react";
import { Settings } from "lucide-react";
import { useRouter, Role } from "./router";

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const { setRole, navigate, role } = useRouter();

  const pick = (r: Role) => {
    setRole(r);
    if (r === "customer") navigate("home");
    if (r === "staff") navigate("staff-dashboard");
    if (r === "admin") navigate("admin-dashboard");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {open && (
        <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-2xl p-3 w-56 border border-[#F39C12]/30">
          <div className="text-xs text-gray-500 mb-2 px-2">Xem giao diện:</div>
          {[
            { r: "customer" as Role, label: "👤 Khách hàng", color: "#C0392B" },
            { r: "staff" as Role, label: "👔 Nhân viên", color: "#1E8449" },
            { r: "admin" as Role, label: "⚙️ Quản trị viên", color: "#6C3483" },
          ].map((o) => (
            <button
              key={o.r}
              onClick={() => pick(o.r)}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-[#FDF6E3] mb-1 ${
                role === o.r ? "bg-[#FDF6E3]" : ""
              }`}
              style={{ color: o.color }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-gray-800/30 hover:bg-gray-800 text-white flex items-center justify-center shadow-lg transition-all"
        title="Chuyển đổi vai trò"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
