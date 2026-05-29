import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "./Breadcrumb";
import { ProductCard } from "../components/ProductCard";
import { products } from "../components/data";
import { Calendar, User, MapPin } from "lucide-react";
import { useRouter } from "../components/router";

const posts = [
  { id: "1", tag: "Huế", color: "#6C3483", title: "Bí mật món Mắm Tôm Chua Huế — Vị xưa giữa lòng phố thị", author: "Minh Trang", date: "22/04/2026", excerpt: "Hơn 200 năm qua, những hũ mắm tôm chua Huế vẫn giữ nguyên công thức từ thời Nguyễn triều...", emoji: "🦐", bg: "from-[#6C3483] to-[#C0392B]" },
  { id: "2", tag: "Đà Nẵng", color: "#C0392B", title: "Đà Nẵng & nghệ thuật bánh tráng cuốn thịt heo hai đầu da", author: "Hoàng Nam", date: "18/04/2026", excerpt: "Một món ăn tưởng chừng đơn giản nhưng ẩn chứa cả triết lý ẩm thực miền Trung...", emoji: "🥟", bg: "from-[#C0392B] to-[#F39C12]" },
  { id: "3", tag: "Quảng Nam", color: "#1E8449", title: "Hương quế Trà My — Ngàn năm lưu truyền thảo mộc quý", author: "Thu Hà", date: "12/04/2026", excerpt: "Đi dọc dãy Trường Sơn, bạn sẽ nghe mùi quế Trà My thoảng trong gió...", emoji: "🌿", bg: "from-[#1E8449] to-[#F39C12]" },
  { id: "4", tag: "Bình Định", color: "#F39C12", title: "Rượu Bàu Đá — Tinh hoa của đất võ trời văn", author: "Văn Đức", date: "08/04/2026", excerpt: "Làng Bàu Đá yên bình với những hũ rượu nếp men lá nức tiếng khắp miền Trung...", emoji: "🍶", bg: "from-[#F39C12] to-[#C0392B]" },
  { id: "5", tag: "Khánh Hòa", color: "#16A085", title: "Yến sào Khánh Hòa — Ngọc trời giữa đại dương", author: "Lan Anh", date: "01/04/2026", excerpt: "Từ những đảo yến hoang sơ, nghề khai thác yến sào đã nuôi sống bao thế hệ...", emoji: "🪹", bg: "from-[#16A085] to-[#6C3483]" },
  { id: "6", tag: "Phú Yên", color: "#2874A6", title: "Cá ngừ đại dương Phú Yên — Vị biển trong từng miếng", author: "Hải Đăng", date: "28/03/2026", excerpt: "Mỗi sớm mai trên bến Tuy Hòa, hàng trăm con cá ngừ được đưa về từ khơi xa...", emoji: "🐟", bg: "from-[#2874A6] to-[#1E8449]" },
];

export function BlogListPage() {
  const { navigate } = useRouter();
  const filters = ["Tất cả", "Huế", "Đà Nẵng", "Quảng Nam", "Bình Định", "Khánh Hòa", "Phú Yên"];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Đi & Viết" }]} />

      <div className="relative h-64 bg-gradient-to-r from-[#6C3483] via-[#C0392B] to-[#F39C12] flex items-center justify-center overflow-hidden">
        <div className="relative text-center text-white px-6">
          <div className="text-5xl mb-3">📖</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "44px", fontWeight: 700 }}>
            Đi & Viết
          </h1>
          <p className="text-white/90 mt-2">Khám phá ẩm thực và văn hóa 19 tỉnh miền Trung Việt Nam</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`px-5 py-2 rounded-full text-sm ${
                i === 0 ? "bg-[#C0392B] text-white" : "bg-white hover:bg-[#FDF6E3]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          onClick={() => navigate("blog-detail")}
          className="bg-white rounded-3xl overflow-hidden mb-8 grid md:grid-cols-2 shadow cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className={`aspect-video md:aspect-auto bg-gradient-to-br ${posts[0].bg} flex items-center justify-center text-[140px]`}>
            {posts[0].emoji}
          </div>
          <div className="p-8">
            <span className="px-3 py-1 rounded-full text-white text-xs mb-3 inline-block" style={{ backgroundColor: posts[0].color }}>
              📍 {posts[0].tag} · Bài nổi bật
            </span>
            <h2 className="mb-3" style={{ fontFamily: "Playfair Display, serif", fontSize: "28px", fontWeight: 700 }}>
              {posts[0].title}
            </h2>
            <p className="text-gray-600 mb-4">{posts[0].excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {posts[0].author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {posts[0].date}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="grid md:grid-cols-2 gap-5">
            {posts.slice(1).map((p) => (
              <article
                key={p.id}
                onClick={() => navigate("blog-detail")}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group"
              >
                <div className={`aspect-video bg-gradient-to-br ${p.bg} flex items-center justify-center text-[90px] group-hover:scale-105 transition-transform`}>
                  {p.emoji}
                </div>
                <div className="p-5">
                  <span className="inline-block px-2 py-0.5 rounded text-white text-xs mb-2" style={{ backgroundColor: p.color }}>
                    📍 {p.tag}
                  </span>
                  <h3 className="mb-2 line-clamp-2" style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700 }}>
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>✍️ {p.author}</span>
                    <span>{p.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl p-5">
              <h3 className="mb-3" style={{ fontFamily: "Playfair Display, serif", fontSize: "18px", fontWeight: 700 }}>
                Sản phẩm được nhắc đến
              </h3>
              <div className="space-y-3">
                {products.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg bg-[#FDF6E3] overflow-hidden shrink-0">
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm line-clamp-1">{p.name}</div>
                      <div className="text-[#C0392B] text-sm" style={{ fontWeight: 600 }}>{p.price.toLocaleString("vi-VN")}₫</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export function BlogDetailPage() {
  const { navigate } = useRouter();
  const p = posts[0];

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <Breadcrumb items={[{ label: "Đi & Viết", screen: "blog" }, { label: p.title.slice(0, 30) + "..." }]} />

      <div className={`h-96 bg-gradient-to-br ${p.bg} flex items-center justify-center text-[200px]`}>
        {p.emoji}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_280px] gap-10">
        <article>
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-white text-sm flex items-center gap-1" style={{ backgroundColor: p.color }}>
              <MapPin className="w-3 h-3" /> {p.tag}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] text-white flex items-center justify-center text-sm">MT</div>
              <div>
                <div style={{ fontWeight: 600 }}>{p.author}</div>
                <div className="text-xs text-gray-500">Tác giả · {p.date}</div>
              </div>
            </div>
          </div>

          <h1 className="mb-6" style={{ fontFamily: "Playfair Display, serif", fontSize: "42px", fontWeight: 700, lineHeight: 1.2 }}>
            {p.title}
          </h1>

          <div className="prose max-w-none text-gray-700 space-y-4 leading-relaxed">
            <p className="text-lg italic text-[#6C3483]">
              "Hũ mắm tôm chua Huế không chỉ là món ăn — đó là ký ức, là tấm lòng, là cả một phần tâm hồn người xứ Huế." — Nghệ nhân Cụ Tâm
            </p>
            <p>Khi nhắc đến ẩm thực Huế, người ta nghĩ ngay đến bún bò, cơm hến hay bánh bột lọc. Nhưng trong mỗi gian bếp cố đô, luôn có một hũ mắm tôm chua — linh hồn thầm lặng của bao bữa cơm.</p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "26px", fontWeight: 700, marginTop: "24px" }}>Hành trình 200 năm</h2>
            <p>Ra đời từ thời Nguyễn triều, mắm tôm chua được cung nữ trong hoàng cung chế biến để dâng lên vua. Trải qua biến cố lịch sử, công thức đã lan tỏa ra dân gian và trở thành biểu tượng ẩm thực xứ Huế.</p>

            <div className="my-6 p-5 border-2 border-[#F39C12] rounded-2xl bg-[#FDF6E3] grid md:grid-cols-[100px_1fr_auto] items-center gap-4">
              <img src={products[2].image} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div>
                <div style={{ fontWeight: 600 }}>{products[2].name}</div>
                <div className="text-[#C0392B]" style={{ fontWeight: 700 }}>{products[2].price.toLocaleString("vi-VN")}₫</div>
              </div>
              <button
                onClick={() => navigate("product")}
                className="px-5 py-2 bg-[#C0392B] text-white rounded-full text-sm"
                style={{ fontWeight: 600 }}
              >
                Mua ngay →
              </button>
            </div>

            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "26px", fontWeight: 700 }}>Bí quyết gia truyền</h2>
            <p>Tôm được chọn phải là tôm đất tươi, ủ với riềng, tỏi, ớt và cơm nếp. Thời gian ủ quyết định hương vị — ít nhất 7 ngày để đạt độ chua dịu, ngọt thanh.</p>
            <p>Người Huế không chỉ ăn mắm tôm chua với bún, cơm, mà còn dùng kèm với thịt luộc, vả trộn, và trong nhiều món ăn cung đình cổ truyền.</p>
          </div>
        </article>

        <aside className="space-y-5">
          <div className="bg-white rounded-2xl p-5 sticky top-28">
            <h3 className="mb-3" style={{ fontWeight: 600 }}>Mục lục</h3>
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="hover:text-[#C0392B] cursor-pointer">— Hành trình 200 năm</li>
              <li className="hover:text-[#C0392B] cursor-pointer">— Bí quyết gia truyền</li>
              <li className="hover:text-[#C0392B] cursor-pointer">— Cách thưởng thức đúng điệu</li>
              <li className="hover:text-[#C0392B] cursor-pointer">— Nơi mua chính gốc</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <h3 className="mb-5" style={{ fontFamily: "Playfair Display, serif", fontSize: "24px", fontWeight: 700 }}>
          Bài viết liên quan
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {posts.slice(1, 4).map((rp) => (
            <div
              key={rp.id}
              onClick={() => navigate("blog-detail")}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className={`aspect-video bg-gradient-to-br ${rp.bg} flex items-center justify-center text-[70px]`}>{rp.emoji}</div>
              <div className="p-4">
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "16px", fontWeight: 700 }} className="line-clamp-2">
                  {rp.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
