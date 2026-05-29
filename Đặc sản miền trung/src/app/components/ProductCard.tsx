import { Star, ShoppingCart, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRouter } from "./router";

export interface Product {
  id: string;
  name: string;
  image: string;
  province: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const provinceColors: Record<string, string> = {
  Huế: "#6C3483",
  "Đà Nẵng": "#C0392B",
  "Quảng Nam": "#1E8449",
  "Quảng Ngãi": "#F39C12",
  "Bình Định": "#2874A6",
  "Nha Trang": "#16A085",
};

export function ProductCard({ product }: { product: Product }) {
  const color = provinceColors[product.province] || "#C0392B";
  const { navigate } = useRouter();

  return (
    <div
      onClick={() => navigate("product")}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#FDF6E3] hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative aspect-square bg-[#FDF6E3] overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="px-2 py-1 bg-[#C0392B] text-white text-xs rounded-full">🔥 Bán chạy</span>
          )}
          {product.isNew && (
            <span className="px-2 py-1 bg-[#1E8449] text-white text-xs rounded-full">Mới</span>
          )}
        </div>
        <div
          className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs flex items-center gap-1"
          style={{ backgroundColor: color }}
        >
          <MapPin className="w-3 h-3" />
          {product.province}
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 h-12 group-hover:text-[#C0392B] transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating) ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[#C0392B]" style={{ fontSize: "18px", fontWeight: 700 }}>
            {product.price.toLocaleString("vi-VN")}₫
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.originalPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("cart");
          }}
          className="w-full py-2 bg-[#FDF6E3] hover:bg-[#C0392B] hover:text-white text-[#C0392B] rounded-full flex items-center justify-center gap-2 transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
