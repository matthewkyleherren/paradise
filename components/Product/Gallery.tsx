"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ProductImage } from "@/lib/products";
import styles from "./Gallery.module.scss";

interface GalleryProps {
  images: ProductImage[];
  current: number;
  onChange: (index: number) => void;
  /** Mobile only: a vertical swipe reveals the description. */
  onSwipeUp?: () => void;
}

// A swipe has to clear this to count, and be more horizontal than vertical
// (or vice versa) to pick an axis.
const SWIPE_THRESHOLD = 45;

function wrap(index: number, length: number): number {
  if (length === 0) return 0;
  return (index + length) % length;
}

/**
 * Full-bleed image gallery. Slides are stacked and cross-faded so the viewport
 * is only ever a single photograph — nothing of the neighbouring slides shows.
 *
 * On desktop the two halves of the screen are invisible prev/next targets; on
 * mobile it's a swipe. The numbered index and the arrow keys work everywhere.
 */
export default function Gallery({ images, current, onChange, onSwipeUp }: GalleryProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const prev = wrap(current - 1, images.length);
  const next = wrap(current + 1, images.length);

  const goPrev = useCallback(() => onChange(prev), [onChange, prev]);
  const goNext = useCallback(() => onChange(next), [onChange, next]);

  // Warm the whole set so switching slides never flashes an empty frame.
  useEffect(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image.webp ?? image.src;
    });
  }, [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      // Drag left to advance, matching the direction of travel.
      if (dx < 0) goNext();
      else goPrev();
    } else {
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      if (dy < 0) onSwipeUp?.();
    }
  };

  if (!images.length) return null;

  return (
    <div
      className={styles.root}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((image, index) => (
        <picture key={image.src} className={styles.slide} data-active={index === current}>
          {image.webp && <source srcSet={image.webp} type="image/webp" />}
          <img
            src={image.src}
            alt=""
            width={image.width}
            height={image.height}
            className={styles.image}
            // The first slide is the page's LCP; the rest are preloaded above.
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            draggable={false}
          />
        </picture>
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.zone} ${styles.zoneLeft}`}
            onClick={goPrev}
            aria-label="Previous image"
          />
          <button
            type="button"
            className={`${styles.zone} ${styles.zoneRight}`}
            onClick={goNext}
            aria-label="Next image"
          />
        </>
      )}
    </div>
  );
}
