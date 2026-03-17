# Spectrum — Daily Word Ordering Puzzle

A PWA word puzzle game where players sort words along a gradient (e.g., coldest to hottest).

## Tech Stack
- Next.js 15 App Router | React 19 | JavaScript (no TypeScript)
- next-pwa for offline/installable support
- Deploy: Vercel
- No CSS framework — inline styles with CSS variables for fonts
- localStorage for persistence (XP, streak, daily completion)

## Rules
- Every client component must have `"use client"` directive
- Guard all localStorage access with `typeof window !== "undefined"`
- Mobile-first design (max-width 430px)
- No backend — everything runs client-side
- Puzzles use seeded daily rotation via `getDailySeed()`

## Structure
```
app/
  layout.js      — Root layout with PWA meta, fonts
  page.js        — Renders <SpectrumGame />
  globals.css    — Minimal reset
components/
  SpectrumGame.jsx — Core game component
public/
  manifest.json  — PWA manifest
  icon-*.png     — PWA icons
```

## Running Locally
```bash
npm run dev    # http://localhost:3000
npm run build  # Production build
```
