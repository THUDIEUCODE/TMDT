import { StaffLayout } from "./StaffLayout";
import { Star, Check, X, Flag, MessageSquare } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { products } from "../components/data";
import { useState } from "react";

const reviews = [
  { id: 1, user: "Nguyễn Minh", product: products[2], rating: 5, date: "25/04/2026", content: "Vị mắm đậm đà đúng kiểu quê nội. Ship nhanh, hũ nguyên vẹn, đóng gói kỹ lưỡng!", status: "pending" },
  { id: 2, user: "Trần Thị Hoa", product: products[4], rating: 5, date: "24/04/2026", content: "Kẹo mè xửng rất ngon, ngọt vừa phải, mè thơm. Mua biếu mẹ được khen nức nở!", status: "pending" },
  { id: 3, user: "Lê Tuấn", product: products[1], rating: 4, date: "23/04/2026", content: "Bánh tráng giòn, nhưng lần trước ship đến bị vỡ mất 2 miếng. Mong shop đóng gói cẩn thận hơn.", status: "pending" },
  { id: 4, user: "Phạm Nam", product: products[3], rating: 5, date: "22/04/2026", content: "Tinh dầu sả chanh thơm dễ chịu, dùng xông phòng rất thích.", status: "approved" },
  { id: 5, user: "Vũ Lan", product: products[0], rating: 2, date: "22/04/2026", content: "Vòng đẹp nhưng dây đứt sau 2 tuần đeo. Thất vọng.", status: "flagged" },
  { id: 6, user: "Đỗ Thư", product: products[5], rating: 5, date: "20/04/2026", content: "Hộp trà cung đình đẹp, sang trọng, vị trà thanh tao.", status: "approved" },
  { id: 7, user: "Võ Hoàng", product: products[6], rating: 5, date: "18/04/2026", content: "Cá khô ngon, mặn vừa, không tanh. Sẽ mua lại!", status: "approved" },
];

const tabs = [
  { id: "all", label: "Tất cả", count: reviews.length },
  { id: "pending", label: "Chờ duyệt", count: reviews.filter(r => r.status === "pending").length, color: "#F39C12" },
  { id: "approved", label: "Đã duyệt", count: reviews.filter(r => r.status === "approved").length, color: "#1E8449" },
  { id: "flagged", label: "Báo cáo", count: reviews.filter(r => r.status === "flagged").length, color: "#C0392B" },
];

export function StaffReviews() {
  const [tab, setTab] = useState("pending");
  const filtered = tab === "all" ? reviews : reviews.filter(r => r.status === tab);
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <StaffLayout title="Quản lý đánh giá">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5">
          <div className="text-sm text-gray-600 mb-2">Điểm trung bình</div>
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "32px", fontWeight: 700, color: "#F39C12" }}>
              {avg.toFixed(1)}
            </span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"}`} />
              ))}
            </div>
          </div>
        </div>
        {[
          { label: "Chờ duyệt", value: 3, color: "#F39C12" },
          { label: "Đã duyệt hôm nay", value: 12, color: "#1E8449" },
          { label: "Bị báo cáo", value: 1, color: "#C0392B" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border-l-4" style={{ borderLeftColor: s.color }}>
            <div className="text-sm text-gray-600">{s.label}</div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "32px", fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              tab === t.id ? "bg-[#1E8449] text-white" : "bg-white hover:bg-[#FDF6E3]"
            }`}
          >
            {t.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${tab === t.id ? "bg-white/30" : "bg-gray-100"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#FDF6E3] overflow-hidden shrink-0">
              <ImageWithFallback src={r.product.image} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C0392B] to-[#6C3483] text-white flex items-center justify-center text-xs" style={{ fontWeight: 700 }}>
                    {r.user[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.user}</div>
                    <div className="text-xs text-gray-500">{r.date} · {r.product.name.slice(0, 30)}...</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-300"}`} />
                    ))}
                  </div>
                  {r.status === "pending" && <span className="px-2 py-0.5 bg-[#F39C12] text-white text-xs rounded-full">Chờ duyệt</span>}
                  {r.status === "approved" && <span className="px-2 py-0.5 bg-[#1E8449] text-white text-xs rounded-full">Đã duyệt</span>}
                  {r.status === "flagged" && <span className="px-2 py-0.5 bg-[#C0392B] text-white text-xs rounded-full">Bị báo cáo</span>}
                </div>
              </div>

              <p className="text-sm text-gray-700 my-3">{r.content}</p>

              <div className="flex gap-2 flex-wrap">
                {r.status === "pending" && (
                  <>
                    <button className="px-3 py-1.5 bg-[#1E8449] text-white rounded-full text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Duyệt
                    </button>
                    <button className="px-3 py-1.5 bg-[#C0392B] text-white rounded-full text-xs flex items-center gap-1">
                      <X className="w-3 h-3" /> Từ chối
                    </button>
                  </>
                )}
                <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs flex items-center gap-1 hover:bg-[#FDF6E3]">
                  <MessageSquare className="w-3 h-3" /> Phản hồi
                </button>
                {r.status !== "flagged" && (
                  <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs flex items-center gap-1 hover:bg-[#FDF6E3] text-[#C0392B]">
                    <Flag className="w-3 h-3" /> Gắn cờ
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </StaffLayout>
  );
}
