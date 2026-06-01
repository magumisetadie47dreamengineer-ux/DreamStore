"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const ENTER_DIRS = ["left", "right", "top", "bottom", "tl", "br"];

const EXIT_BY_ENTER = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
  tl: "br",
  br: "tl",
};

export default function HeroProductBackdrop({ products }) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const [energyTick, setEnergyTick] = useState(0);
  const count = products?.length ?? 0;

  const advance = useCallback(() => {
    if (count < 2) return;
    setActive((current) => {
      setLeaving(current);
      setEnergyTick((t) => t + 1);
      return (current + 1) % count;
    });
  }, [count]);

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(advance, 4200);
    return () => clearInterval(timer);
  }, [count, advance]);

  useEffect(() => {
    if (leaving === null) return;
    const clear = setTimeout(() => setLeaving(null), 1100);
    return () => clearTimeout(clear);
  }, [leaving, active]);

  if (!count) return null;

  if (count === 1) {
    return (
      <div
        className="product-photo pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <Image
          src={products[0].image}
          alt=""
          fill
          className="hero-bg-image object-cover scale-110"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 z-[4] bg-gradient-to-b from-base-100/75 via-base-100/55 to-base-100/85" />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0">
        {products.map((p, i) => {
          const isActive = i === active;
          const isLeaving = i === leaving;
          if (!isActive && !isLeaving) return null;

          const enterDir = ENTER_DIRS[i % ENTER_DIRS.length];
          const exitDir = EXIT_BY_ENTER[enterDir];

          let animClass = "";
          if (isActive) animClass = `hero-bg-enter-${enterDir}`;
          if (isLeaving) animClass = `hero-bg-exit-${exitDir}`;

          return (
            <div
              key={p._id}
              className={`product-photo absolute inset-0 ${animClass}`}
              style={{ zIndex: isActive ? 2 : 1 }}
            >
              <Image
                src={p.image}
                alt=""
                fill
                className="hero-bg-image object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          );
        })}
      </div>

      {/* Energy burst on each transition */}
      <div
        key={energyTick}
        className="absolute inset-0 z-[3] hero-bg-energy-flash bg-gradient-to-br from-white/35 via-white/10 to-transparent mix-blend-screen"
      />
      <div
        key={`scan-${energyTick}`}
        className="absolute inset-x-0 top-0 h-1/3 z-[3] hero-bg-energy-scan bg-gradient-to-b from-white/25 to-transparent"
      />

      {/* Dark overlay — B&W UI text readable; photos keep true color underneath */}
      <div className="absolute inset-0 z-[4] bg-gradient-to-b from-base-100/75 via-base-100/55 to-base-100/85" />
      <div className="absolute inset-0 z-[4] bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(8%_0_0_/_0.35)_100%)]" />
    </div>
  );
}
