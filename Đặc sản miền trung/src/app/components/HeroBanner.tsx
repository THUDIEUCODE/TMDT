import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    badge: "🎊 Tết Nguyên Đán 2026",
    title: "Quà Tết Đặc Sản Miền Trung",
    desc: "Gửi gắm hương vị quê nhà trong từng hộp quà sang trọng — đậm đà bản sắc ba miền.",
    cta: "Khám phá Combo Tết",
    bg: "from-[#C0392B] via-[#a93226] to-[#6C3483]",
    accent: "#F39C12",
  },
  {
    badge: "🏮 Xứ Huế Cố Đô",
    title: "Hương Vị Hoàng Cung",
    desc: "Mắm ruốc, kẹo mè xửng, tôm chua — tinh hoa ẩm thực đất thần kinh.",
    cta: "Xem đặc sản Huế",
    bg: "from-[#6C3483] via-[#7d3c98] to-[#C0392B]",
    accent: "#F39C12",
  },
  {
    badge: "✨ Sản Phẩm Mới",
    title: "Tinh Dầu Thiên Nhiên",
    desc: "100% thảo mộc vùng cao miền Trung — thư giãn, chữa lành, an yên.",
    cta: "Mua ngay",
    bg: "from-[#1E8449] via-[#196f3d] to-[#F39C12]",
    accent: "#FDF6E3",
  },
];

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden">
      <div className={`bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 70%, #fff 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8 items-center relative">
          <div className="text-[#FDF6E3]">
            <span
              className="inline-block px-4 py-1 rounded-full mb-4 bg-white/15 backdrop-blur-sm border border-white/30"
              style={{ color: slide.accent }}
            >
              {slide.badge}
            </span>
            <h1
              className="mb-4 text-[#FDF6E3]"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "52px", fontWeight: 700, lineHeight: 1.1 }}
            >
              {slide.title}
            </h1>
            <p className="mb-8 text-white/90 max-w-lg">{slide.desc}</p>
            <button
              className="px-8 py-3 rounded-full bg-[#F39C12] text-[#6C3483] hover:scale-105 transition-transform shadow-lg"
              style={{ fontWeight: 600 }}
            >
              {slide.cta} →
            </button>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-[#F39C12]/30 blur-3xl" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#F39C12] to-[#C0392B] flex items-center justify-center border-8 border-[#FDF6E3]/30 shadow-2xl">
                <div className="text-[120px]">🏮</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40"
        >
          <ChevronRight />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-[#F39C12]" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
