import { Header } from "../components/Header";
import { HeroBanner } from "../components/HeroBanner";
import { ProductCard } from "../components/ProductCard";
import { SectionTitle } from "../components/SectionTitle";
import { VoucherSection } from "../components/VoucherSection";
import { ComboSection } from "../components/ComboSection";
import { BlogSection } from "../components/BlogSection";
import { ProvinceMap } from "../components/ProvinceMap";
import { Footer } from "../components/Footer";
import { products } from "../components/data";

export function HomePage() {
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
      <HeroBanner />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionTitle
          badge="Bán Chạy Nhất"
          icon="🔥"
          title="Đặc Sản Được Yêu Thích"
          subtitle="Những hương vị miền Trung được khách hàng khắp cả nước tin chọn."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <SectionTitle badge="Sản Phẩm Mới" icon="✨" title="Vừa Cập Bến" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionTitle badge="Voucher & Khuyến Mãi" icon="🎟️" title="Ưu Đãi Hôm Nay" />
        <VoucherSection />
      </section>

      <section className="bg-gradient-to-b from-[#FDF6E3] to-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle badge="Combo Quà Tặng" icon="🎁" title="Gói Trọn Tấm Lòng" />
          <ComboSection />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionTitle badge="Đi & Viết" icon="📖" title="Câu Chuyện Ẩm Thực" />
        <BlogSection />
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionTitle badge="Đặc Sản Theo Tỉnh" icon="🧭" title="19 Tỉnh — 1 Tấm Lòng" />
        <ProvinceMap />
      </section>

      <Footer />
    </div>
  );
}
