"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Description.module.scss";

interface DescriptionProps {
  title: string;
  /** Authored HTML from the static export — not user input. */
  html: string;
  isVisible: boolean;
  onClose: () => void;
  /** Reports scroll position so the parent can close on an over-scroll up. */
  onScroll?: (scrollTop: number) => void;
}

/**
 * The description panel — the main body of the page. It lives on the same route
 * as an overlay: the gallery stays mounted underneath and the panel rises over
 * it, so moving between media and text never costs a navigation.
 */
export default function Description({
  title,
  html,
  isVisible,
  onClose,
  onScroll,
}: DescriptionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    // Respect a reduced-motion preference: same states, no travel.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (isVisible) {
        gsap.set(root, { pointerEvents: "auto", visibility: "visible" });
        gsap
          .timeline()
          .fromTo(
            panel,
            { yPercent: reduced ? 0 : 6, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: reduced ? 0.2 : 0.5, ease: "power3.out" }
          )
          .fromTo(
            panel.querySelectorAll("[data-anim='fade']"),
            { y: reduced ? 0 : 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: reduced ? 0.2 : 0.4,
              stagger: reduced ? 0 : 0.06,
              ease: "power2.out",
            },
            "-=0.25"
          );
      } else {
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(root, { pointerEvents: "none", visibility: "hidden" });
            },
          })
          .to(panel, {
            yPercent: reduced ? 0 : 6,
            opacity: 0,
            duration: reduced ? 0.15 : 0.4,
            ease: "power3.in",
          });
      }
    }, root);

    return () => ctx.revert();
  }, [isVisible]);

  // Reset to the top on dismiss, so reopening doesn't restore a stale offset.
  useEffect(() => {
    if (!isVisible && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [isVisible]);

  return (
    <div className={styles.root} ref={rootRef} aria-hidden={!isVisible}>
      <div className={styles.panel} ref={panelRef}>
        <div
          className={styles.body}
          ref={bodyRef}
          onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}
        >
          <div className={styles.inner}>
            <h1 className={styles.title} data-anim="fade">
              {title}
            </h1>
            <div
              className={styles.copy}
              data-anim="fade"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>

        <button type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
