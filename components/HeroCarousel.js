"use client";

import { useEffect, useState, useRef } from "react";

export default function HeroCarousel({ images, fallback }) {
  const list = (images && images.length > 0) ? images : (fallback ? [fallback] : []);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const intervalRef = useRef(null);

  // Auto-advance every 5 seconds (only if more than 1 image)
  useEffect(() => {
    if (list.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % list.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [list.length]);

  const goTo = (idx) => {
    setCurrent(idx);
    // Reset auto-advance timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % list.length);
      }, 5000);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo((current + 1) % list.length);
      else goTo((current - 1 + list.length) % list.length);
    }
    touchStartX.current = null;
  };

  if (list.length === 0) return null;

  return (
    <div
      className="hero-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-carousel-track">
        {list.map((src, i) => (
          <div
            key={i}
            className={`hero-carousel-slide ${i === current ? "active" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Kezia Kenova ${i + 1}`} />
          </div>
        ))}
        <div className="frame-glow"></div>
      </div>

      {list.length > 1 && (
        <div className="hero-carousel-dots">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`hero-dot ${i === current ? "active" : ""}`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
