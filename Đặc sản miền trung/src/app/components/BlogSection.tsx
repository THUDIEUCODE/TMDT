const posts = [
  {
    tag: "Huế",
    tagColor: "#6C3483",
    title: "Bí mật món Mắm Tôm Chua Huế — Vị xưa giữa lòng phố thị",
    author: "Minh Trang",
    excerpt:
      "Hơn 200 năm qua, những hũ mắm tôm chua Huế vẫn giữ nguyên công thức từ thời Nguyễn triều...",
    emoji: "🦐",
    bg: "from-[#6C3483] to-[#C0392B]",
  },
  {
    tag: "Đà Nẵng",
    tagColor: "#C0392B",
    title: "Đà Nẵng & nghệ thuật bánh tráng cuốn thịt heo hai đầu da",
    author: "Hoàng Nam",
    excerpt:
      "Một món ăn tưởng chừng đơn giản nhưng ẩn chứa cả triết lý ẩm thực miền Trung...",
    emoji: "🥟",
    bg: "from-[#C0392B] to-[#F39C12]",
  },
  {
    tag: "Quảng Nam",
    tagColor: "#1E8449",
    title: "Hương quế Trà My — Ngàn năm lưu truyền thảo mộc quý",
    author: "Thu Hà",
    excerpt:
      "Đi dọc dãy Trường Sơn, bạn sẽ nghe mùi quế Trà My thoảng trong gió — thứ mùi không nơi nào có được...",
    emoji: "🌿",
    bg: "from-[#1E8449] to-[#F39C12]",
  },
];

export function BlogSection() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {posts.map((p) => (
        <article
          key={p.title}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
        >
          <div
            className={`aspect-video bg-gradient-to-br ${p.bg} flex items-center justify-center relative overflow-hidden`}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
              }}
            />
            <div className="text-[100px] group-hover:scale-110 transition-transform">{p.emoji}</div>
          </div>
          <div className="p-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-white text-xs mb-3"
              style={{ backgroundColor: p.tagColor }}
            >
              📍 {p.tag}
            </span>
            <h3
              className="mb-2 group-hover:text-[#C0392B] transition-colors line-clamp-2"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700 }}
            >
              {p.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.excerpt}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">✍️ {p.author}</span>
              <span className="text-[#C0392B]">Đọc thêm →</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
