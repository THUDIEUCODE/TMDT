import { ChevronRight, Home } from "lucide-react";
import { useRouter, Screen } from "../components/router";

export function Breadcrumb({ items }: { items: { label: string; screen?: Screen }[] }) {
  const { navigate } = useRouter();
  return (
    <div className="bg-white border-b border-[#FDF6E3]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-600">
        <button onClick={() => navigate("home")} className="hover:text-[#C0392B] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Trang chủ
        </button>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5" />
            {item.screen ? (
              <button onClick={() => navigate(item.screen!)} className="hover:text-[#C0392B]">
                {item.label}
              </button>
            ) : (
              <span className="text-[#C0392B]">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
