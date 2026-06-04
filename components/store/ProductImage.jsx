"use client";

import { useEffect, useState } from "react";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

/**
 * Plain <img> for reliable loading on Vercel (avoids next/image optimizer issues).
 */
export default function ProductImage({
  src,
  alt,
  className = "",
  fill,
  priority,
  sizes: _sizes,
  ...rest
}) {
  const pick =
    src?.startsWith("http") || src?.startsWith("/")
      ? src
      : PRODUCT_IMAGE_FALLBACK;
  const [imgSrc, setImgSrc] = useState(pick);

  useEffect(() => {
    setImgSrc(
      src?.startsWith("http") || src?.startsWith("/")
        ? src
        : PRODUCT_IMAGE_FALLBACK
    );
  }, [src]);

  const fillClass = fill
    ? "absolute inset-0 h-full w-full object-cover object-center"
    : "";

  return (
    <img
      {...rest}
      src={imgSrc}
      alt={alt || ""}
      className={`${fillClass} ${className}`.trim()}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== PRODUCT_IMAGE_FALLBACK) {
          setImgSrc(PRODUCT_IMAGE_FALLBACK);
        }
      }}
    />
  );
}
