const combos = [
  {
    title: "Combo Tết Nguyên Đán",
    tag: "Tết Nguyên Đán",
    desc: "Hộp quà cao cấp 8 món đặc sản tinh tuyển — đậm đà hương vị sum vầy.",
    price: "890.000₫ - 1.500.000₫",
    emoji: "🧧",
    bg: "from-[#C0392B] to-[#F39C12]",
  },
  {
    title: "Combo Quà Biếu Sang Trọng",
    tag: "Quà Biếu",
    desc: "Dành cho đối tác, người thân — gói trọn tấm lòng trong sắc vàng cung đình.",
    price: "650.000₫ - 1.200.000₫",
    emoji: "🎁",
    bg: "from-[#6C3483] to-[#C0392B]",
  },
  {
    title: "Đặc Sản Xứ Huế",
    tag: "Đặc Sản Huế",
    desc: "Tôm chua, mè xửng, trà cung đình — tinh hoa đất thần kinh trong một hộp.",
    price: "450.000₫ - 850.000₫",
    emoji: "🏯",
    bg: "from-[#1E8449] to-[#6C3483]",
  },
];

export function ComboSection() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {combos.map((c) => (
        <div
          key={c.title}
          className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br ${c.bg} p-8 text-white cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1`}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <div className="text-[80px] mb-4 group-hover:scale-110 transition-transform">{c.emoji}</div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs mb-3">
              {c.tag}
            </span>
            <h3
              className="mb-2"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}
            >
              {c.title}
            </h3>
            <p className="text-white/90 text-sm mb-4">{c.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[#F39C12]" style={{ fontWeight: 700 }}>{c.price}</span>
              <button className="px-4 py-1.5 bg-white text-[#C0392B] rounded-full text-sm group-hover:bg-[#F39C12] group-hover:text-white transition-colors">
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
