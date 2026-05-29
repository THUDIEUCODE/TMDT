export function SectionTitle({
  badge,
  title,
  subtitle,
  icon,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="text-center mb-10">
      {badge && (
        <span className="inline-block px-4 py-1 bg-[#C0392B]/10 text-[#C0392B] rounded-full mb-3">
          {icon} {badge}
        </span>
      )}
      <h2
        className="text-[#6C3483] mb-2"
        style={{ fontFamily: "Playfair Display, serif", fontSize: "36px", fontWeight: 700 }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="w-8 h-px bg-[#F39C12]" />
        <div className="w-2 h-2 rounded-full bg-[#F39C12]" />
        <div className="w-8 h-px bg-[#F39C12]" />
      </div>
    </div>
  );
}
