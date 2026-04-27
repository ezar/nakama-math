# Nakama Math

[![Deploy to GitHub Pages](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml/badge.svg)](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-offline--first-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#license)

A math practice web app for kids with a One Piece theme. Players earn Berries, unlock pirate ranks, and battle through four game modes — all without an internet connection or user account.

**🌐 Live app: [ezar.github.io/nakama-math](https://ezar.github.io/nakama-math/)**

---

## Features

- **8 pirate ranks** — Cabin Boy → Pirate King, each unlocked by earning Berries
- **4 game modes** — Swordsman (relaxed), Gear Second (timed), Survival (3 lives), Storm (blitz)
- **Streak multipliers** — ×1.2 at 3, ×2 at 5 (Gear Second), ×3 at 10 (Gear Third)
- **6 player profiles** stored in `localStorage` — no account needed
- **Offline-first PWA** — installable, works without internet after first visit
- **3 languages** — Spanish, English, Catalan (auto-detected from the browser)
- **Synthesized audio** — sound effects via Web Audio API, zero audio files
- **Accessible** — keyboard navigation, `prefers-reduced-motion` respected, AA contrast

---

## Math levels

| # | Rank | Operations | Berries to unlock |
|---|------|-----------|-------------------|
| 1 | Cabin Boy | + / − up to 10 | 0 |
| 2 | Sailor | + / − up to 20 | 500 |
| 3 | Pirate | + / − up to 100, ×2 ×5 | 1 500 |
| 4 | First Mate | Times tables ×2–×10 | 3 000 |
| 5 | Captain | Multiplication & exact division | 6 000 |
| 6 | Warlord | Division with remainder, multi-step | 12 000 |
| 7 | Emperor | Simple fractions, basic percentages | 25 000 |
| 8 | Pirate King | Fractions, advanced %, exponents | 50 000 |

Adding a new level means adding one object to `src/config/levels.ts` — no other files need to change.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| State | Zustand with `persist` middleware |
| Animations | Framer Motion |
| Styles | Tailwind CSS |
| Fonts | Bangers (titles) + Nunito (body) via Google Fonts |
| PWA | vite-plugin-pwa + Workbox |
| Tests | Vitest |

---

## Project structure

```
src/
├── config/
│   └── levels.ts          # ← only file to edit for new levels
├── engine/
│   ├── QuestionEngine.ts  # pure functions, no React imports
│   ├── QuestionEngine.test.ts
│   └── types.ts
├── store/
│   ├── profileStore.ts    # persisted: profiles, berries, stats
│   ├── gameStore.ts       # ephemeral: current game state
│   └── settingsStore.ts   # persisted: locale, sound
├── screens/
│   ├── IntroScreen.tsx
│   ├── HubScreen.tsx
│   ├── GameScreen.tsx
│   ├── ResultsScreen.tsx
│   └── RankingScreen.tsx
├── components/            # ProfileCard, QuestionCard, AnswerButton…
├── audio/
│   └── useSoundEffect.ts  # Web Audio API, no audio files
├── i18n/
│   ├── translations.ts    # ES / EN / CA
│   └── useTranslation.ts
└── utils/
    └── rankSystem.ts
```

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173/nakama-math/
```

```bash
npm run test       # Vitest — must pass before any commit
npm run type-check # tsc --noEmit
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Question engine

The engine is pure TypeScript — no React, no side effects. Every question is generated algorithmically at runtime: no pre-written question banks.

Distractors are crafted per operation to be educationally meaningful:

| Operation | Decoy strategy |
|-----------|---------------|
| Add / Sub | ±1, ±10, transposed operands, confused with multiplication |
| Multiply | confused with addition (a+b), off-by-one in table |
| Divide | dividend/divisor swapped, result ±1 |
| Fraction | forgot to multiply, multiplied instead of fraction |
| Percentage | divided by 10 instead of 100, forgot to divide |
| Exponent | confused with multiplication (a×b) |

**Test invariants** (run against 500 samples per level):

- `allAnswers` always has exactly 4 entries
- All 4 entries are unique
- The correct answer is always present in `allAnswers`
- Results are integers when `requireIntegerResults: true`
- No negative answers when `allowNegativeResults: false`

---

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that runs tests, builds the app, and deploys to GitHub Pages via the official `actions/deploy-pages` action.

**One-time setup:** GitHub → Settings → Pages → Source → **GitHub Actions**.

The build version (`yy.mm.dd.hhmm`) is injected at build time and shown in the footer.

---

## Adding a new level

1. Open `src/config/levels.ts`
2. Add a `LevelConfig` object to the `LEVELS` array
3. Set `xpToUnlock` to the Berry threshold
4. If you introduce a new `Operation`, add its logic to `QuestionEngine.ts` and tests to `QuestionEngine.test.ts`
5. Run `npm run test` — all must pass
6. Done. `HubScreen`, `RankingScreen`, and the rank system pick it up automatically.

---

## License

Private project. All rights reserved.
