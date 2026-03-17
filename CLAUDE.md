# Spectrum — Daily Word Ordering Puzzle

A PWA word puzzle game where players sort words along a gradient (e.g., coldest to hottest).

## Tech Stack
- Next.js 16 App Router | React 19 | JavaScript (no TypeScript)
- @ducanh2912/next-pwa for offline/installable support
- Deploy: Vercel (production: spectrum.mattatencio.com)
- Inline styles + CSS Modules for animations
- localStorage for persistence (XP, streak, daily completion, onboarding)
- Fonts: DM Serif Display + Outfit via next/font/google

## Rules
- Every client component must have `"use client"` directive
- Guard all localStorage access with `typeof window !== "undefined"`
- Mobile-first design — viewport-pinned (100dvh, no scroll), max-width 430px
- No backend — everything runs client-side
- Puzzles use seeded daily rotation via `getDailySeed()`
- Build uses `--webpack` flag (next-pwa incompatible with Turbopack)
- Cloudflare DNS must be DNS-only (no proxy) for Vercel SSL

## Structure
```
app/
  layout.js                    — Root layout with PWA meta, fonts, OG tags
  page.js                      — Renders <SpectrumGame />
  globals.css                  — Reset + scroll prevention
components/
  SpectrumGame.jsx             — Core game component (drag-and-drop + tap-to-swap)
  SpectrumGame.module.css      — Animations, card styles, onboarding modal
data/
  puzzles.js                   — 32 puzzle definitions
public/
  manifest.json                — PWA manifest
  icon-*.png                   — PWA icons (placeholder gradients)
```

## Running Locally
```bash
npm run dev    # http://localhost:3000 (Turbopack)
npm run build  # Production build (webpack, generates service worker)
```

## Deploying
```bash
npx vercel --prod  # Deploys to spectrum.mattatencio.com
```
