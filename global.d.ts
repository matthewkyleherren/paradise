import type Lenis from "@studio-freight/lenis";

export {};

declare global {
  interface Window {
    exitHomeSketch?: (callback: () => void) => void;
    lenis?: Lenis;
  }
}
