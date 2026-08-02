"use client";

import styles from "./SlideSelector.module.scss";

interface SlideSelectorProps {
  count: number;
  current: number;
  onSelect: (index: number) => void;
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Numbered slide index — 01 02 03 04 — with the active one marked. */
export default function SlideSelector({ count, current, onSelect }: SlideSelectorProps) {
  if (count <= 1) return null;

  return (
    <ul className={styles.root}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <button
            type="button"
            className={styles.item}
            data-active={index === current}
            onClick={() => onSelect(index)}
            aria-label={`Image ${index + 1} of ${count}`}
            aria-current={index === current}
          >
            {pad(index)}
          </button>
        </li>
      ))}
    </ul>
  );
}
