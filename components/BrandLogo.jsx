import { brand } from "@/lib/brand";

const heights = {
  sm: 40,
  md: 48,
  lg: 120,
};

export default function BrandLogo({
  variant = "full",
  size = "md",
  className = "",
  priority = false,
}) {
  const height = heights[size] ?? heights.md;
  const src = variant === "icon" ? brand.logo.icon : brand.logo.full;

  return (
    <img
      src={src}
      alt={`${brand.dreamChaser} — ${brand.name}`}
      height={height}
      className={`shrink-0 w-auto object-contain ${className}`.trim()}
      style={{ height: `${height}px` }}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
