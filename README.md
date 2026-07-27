# Jordi Garreta — Creative Portfolio

Next.js App Router portfolio with Sanity CMS, Three.js, and GSAP.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev    # Development server
npm run build  # Production build
npm start      # Serve production build
npm run lint   # ESLint
```

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (usually `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |

Sanity Studio is available at `/studio` once the app is running.

## Stack

- **Next.js** App Router
- **Sanity** CMS (`/studio`)
- **Three.js** spiral/gallery homepage
- **GSAP** page transitions
- **Lenis** smooth scroll
