# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

No test suite configured.

## Architecture Overview

This is a creative portfolio built with **Next.js App Router**, **Sanity CMS**, **Three.js**, and **GSAP**.

### Pages & Routing (`/app/`)
- `/` — Home page: 3D spiral slider (Three.js) + mouse-drag project browsing
- `/p/[slug]` — Individual project/post detail
- `/lab` — Infinite canvas grid of experiments (GSAP Draggable)
- `/about` — About page with tech stack and achievements
- `/product/[section]/[product]` — Full-bleed image page with a description overlay
- `/studio/[[...tool]]` — Sanity CMS admin

### Data Flow
Pages fetch content from Sanity in `useEffect` via `client.fetch()` (defined in `/lib/`), store it in local `useState`, then trigger GSAP animation sequences. No global state manager — all state is local React hooks.

**The product route is the exception**: it reads a static JSON catalogue (`lib/data/products.json`) through `lib/products.ts` — no Sanity, no backend, no fetch. See `lib/data/README.md` for the schema. Server component resolves params → `getProductView()` narrows the payload → the client component owns all interaction.

### The product page (`/components/Product/`)
A fixed, non-scrolling white surface that opts out of the site's dark shell. `Navigation` hides itself on `/product` (and `/studio`) — it would land on top of the page's own header.

- **Gallery** — stacked, cross-faded slides. Prev/next via invisible half-screen click zones (desktop), swipe (mobile), the numbered index, or arrow keys. Nothing of the neighbouring slides is ever visible.
- **Description** — a GSAP overlay on the *same route*, so the gallery never unmounts. Opens on scroll-down / swipe-up / the header toggle; closes on scroll-up at the top, Esc, or Close.
- Mobile uses `100dvh` and `env(safe-area-inset-*)`; the breakpoint (750px) lives in `components/Product/_grid.scss` alongside the 12-column layout mixins ported from the source site.

### Animation System
- **GSAP timelines** orchestrate page enter/exit transitions — see `/app/animations.ts`
- `data-anim` attributes on DOM elements are used as animation targets
- Page transitions sequence: animate out → navigate → animate in
- **Lenis smooth scroll** is integrated via `SmoothScrollProvider` component, hooked into GSAP ticker
- The homepage uses a `window.exitHomeSketch` callback (declared in `global.d.ts`) to trigger Three.js cleanup before navigating away

### 3D Rendering (Homepage)
- **Three.js** spiral slider lives in `/components/InfiniteSlider.js` (plain JS class, not React)
- Custom GLSL shaders imported as strings via webpack/turbopack raw-loader — see `/app/shaders/`
- Shader files use `.glsl`, `.vert`, `.frag` extensions configured in `next.config.ts`

### CMS (Sanity)
- Schema types in `/sanity/schemaTypes/` (post, about, lab, home)
- GROQ queries in `/lib/`
- Images use Sanity's `urlFor()` builder from `@sanity/image-url`
- Sanity Studio is embedded at `/studio` route

### Styling
- **SCSS Modules** per component/page — imported as `styles` object
- Global CSS variables: `--background` (#F4F4F6), `--foreground` (#202123)
- Default font: Geist Mono (monospace)
- Smooth scroll styles come from Lenis (`globals.scss`)

### Key Environment Variables
```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
```
