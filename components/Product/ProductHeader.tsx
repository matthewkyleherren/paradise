"use client";

import Link from "next/link";
import styles from "./ProductHeader.module.scss";

interface ProductHeaderProps {
  title: string;
  /** Where the back link points. */
  backHref: string;
  backLabel: string;
  showDescription: boolean;
  onShowMedia: () => void;
  onShowDescription: () => void;
}

/**
 * Top bar: a back link, then a toggle between the media and the description.
 * The description is an overlay on the same route, so the toggle never costs a
 * navigation and the gallery stays mounted behind it.
 */
export default function ProductHeader({
  title,
  backHref,
  backLabel,
  showDescription,
  onShowMedia,
  onShowDescription,
}: ProductHeaderProps) {
  return (
    <header className={styles.root}>
      <Link href={backHref} className={styles.link}>
        {backLabel}
      </Link>

      <div className={styles.toggle}>
        <button
          type="button"
          className={styles.link}
          data-active={!showDescription}
          onClick={onShowMedia}
        >
          {title}
        </button>
        <button
          type="button"
          className={styles.link}
          data-active={showDescription}
          onClick={onShowDescription}
        >
          Description
        </button>
      </div>
    </header>
  );
}
