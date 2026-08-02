"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProfileView as ProfileViewModel } from "@/lib/profiles";
import Gallery from "./Gallery";
import ProfileHeader from "./ProfileHeader";
import ProfileFooter from "./ProfileFooter";
import Description from "./Description";
import styles from "./ProfileView.module.scss";

const MOBILE_WIDTH = 750;
// Ignore the tail of a trackpad's inertia so one flick is one gesture.
const WHEEL_THRESHOLD = 24;
const GESTURE_COOLDOWN = 700;

interface ProfileViewProps {
  profile: ProfileViewModel;
  backHref?: string;
  backLabel?: string;
}

/**
 * The route mounts this under a key of `section/slug`, so navigating between
 * entries remounts it and the local state (slide, description) resets on its own.
 */
export default function ProfileView({
  profile,
  backHref = "/",
  backLabel = "Index",
}: ProfileViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const descriptionScrollTop = useRef(0);
  const gestureLockedUntil = useRef(0);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_WIDTH}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Falls back to the desktop set: not every entry ships mobile crops.
  const images =
    isMobile && profile.images.mobile.length
      ? profile.images.mobile
      : profile.images.desktop;

  const openDescription = useCallback(() => {
    setShowDescription(true);
    descriptionScrollTop.current = 0;
    gestureLockedUntil.current = Date.now() + GESTURE_COOLDOWN;
  }, []);

  const closeDescription = useCallback(() => {
    setShowDescription(false);
    descriptionScrollTop.current = 0;
    gestureLockedUntil.current = Date.now() + GESTURE_COOLDOWN;
  }, []);

  // Wheel down opens the description; wheel up closes it, but only once the
  // panel's own scroll is back at the top — otherwise it just scrolls.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      if (Date.now() < gestureLockedUntil.current) return;

      if (e.deltaY > 0) {
        if (!showDescription) openDescription();
      } else if (showDescription && descriptionScrollTop.current <= 0) {
        closeDescription();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [showDescription, openDescription, closeDescription]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDescription) closeDescription();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDescription, closeDescription]);

  return (
    <main className={styles.root}>
      <Gallery
        images={images}
        current={currentSlide}
        onChange={setCurrentSlide}
        // On mobile a vertical swipe is the description gesture, so the gallery
        // only claims horizontal ones.
        onSwipeUp={isMobile ? openDescription : undefined}
      />

      <Description
        title={profile.title}
        html={profile.description}
        isVisible={showDescription}
        onClose={closeDescription}
        onScroll={(top) => {
          descriptionScrollTop.current = top;
        }}
      />

      <ProfileHeader
        title={profile.title}
        backHref={backHref}
        backLabel={backLabel}
        showDescription={showDescription}
        onShowMedia={closeDescription}
        onShowDescription={openDescription}
      />

      <ProfileFooter
        isVisible={!showDescription}
        slideCount={images.length}
        currentSlide={currentSlide}
        onSlideSelect={setCurrentSlide}
      />
    </main>
  );
}
