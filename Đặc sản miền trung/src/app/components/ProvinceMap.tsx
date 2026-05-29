const provinces = [
  { name: "Thanh Hóa", products: 24 },
  { name: "Nghệ An", products: 38 },
  { name: "Hà Tĩnh", products: 19 },
  { name: "Quảng Bình", products: 22 },
  { name: "Quảng Trị", products: 15 },
  { name: "Huế", products: 86, featured: true },
  { name: "Đà Nẵng", products: 74, featured: true },
  { name: "Quảng Nam", products: 52, featured: true },
  { name: "Quảng Ngãi", products: 31 },
  { name: "Bình Định", products: 28 },
  { name: "Phú Yên", products: 20 },
  { name: "Khánh Hòa", products: 45 },
  { name: "Ninh Thuận", products: 17 },
  { name: "Bình Thuận", products: 23 },
  { name: "Kon Tum", products: 12 },
  { name: "Gia Lai", products: 18 },
  { name: "Đắk Lắk", products: 41 },
  { name: "Đắk Nông", products: 14 },
  { name: "Lâm Đồng", products: 37 },
];

export function ProvinceMap() {
  return (
    <div className="bg-gradient-to-br from-[#FDF6E3] to-[#F39C12]/20 rounded-3xl p-8 md:p-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-[140px] text-center md:text-left">🗺️</div>
          <p className="text-gray-700 mt-4">
            Từ miền xứ Thanh ra đến Bình Thuận nắng gió, từ cao nguyên Tây Nguyên về duyên hải — mỗi tỉnh một
            đặc sản, một câu chuyện, một tấm lòng.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {provinces.map((p) => (
            <button
              key={p.name}
              className={`p-3 rounded-xl transition-all hover:-translate-y-0.5 text-left ${
                p.featured
                  ? "bg-gradient-to-br from-[#C0392B] to-[#6C3483] text-white shadow-md"
                  : "bg-white hover:bg-[#F39C12] hover:text-white"
              }`}
            >
              <div className="text-xs" style={{ fontWeight: 600 }}>
                {p.name}
              </div>
              <div className={`text-xs ${p.featured ? "text-[#F39C12]" : "text-gray-500"}`}>
                {p.products} sản phẩm
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
