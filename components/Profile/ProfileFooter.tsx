"use client";

import SlideSelector from "./SlideSelector";
import styles from "./ProfileFooter.module.scss";

interface ProfileFooterProps {
  slideCount: number;
  currentSlide: number;
  onSlideSelect: (index: number) => void;
  isVisible: boolean;
}

/** Bottom bar. The gallery index is all that lives down here. */
export default function ProfileFooter({
  slideCount,
  currentSlide,
  onSlideSelect,
  isVisible,
}: ProfileFooterProps) {
  if (slideCount <= 1) return null;

  return (
    <div className={styles.root} data-visible={isVisible}>
      <SlideSelector count={slideCount} current={currentSlide} onSelect={onSlideSelect} />
    </div>
  );
}
