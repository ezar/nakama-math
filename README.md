# Nakama Math

[![Deploy to GitHub Pages](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml/badge.svg)](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-offline--first-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#license)

A math practice PWA for kids with a One Piece theme. Players earn Berries, climb pirate ranks, and compete across eight game modes — all without an internet connection or user account.

**🌐 Live app: [ezar.github.io/nakama-math](https://ezar.github.io/nakama-math/)**

---

## Features

- **8 pirate ranks** — Cabin Boy → Pirate King, unlocked by earning Berries
- **8 game modes** — relaxed, timed, survival, blitz, VS AI, local duel, time trial, practice
- **Daily Challenge** — same 5 questions for every player each day (seeded RNG), ×3 Berry bonus, daily streak tracking
- **Streak multipliers** — ×1.2 at 3, ×2 at 5 (Gear Second), ×3 at 10 (Gear Third)
- **Error review** — collapsible post-game list of every wrong answer with the correct solution
- **VS AI** — challenge one of 4 One Piece characters (Chopper → Robin, 40 %–95 % accuracy)
- **Local Duel** — two players share the device, pass-and-play with full handoff screen
- **Time Trial** — answer as many as possible in 60 seconds
- **Practice mode** — choose a specific operation, infinite questions, zero pressure
- **6 player profiles** stored in `localStorage` — no account needed
- **18 achievements** — streaks, milestones, rank-ups, level unlocks, daily streaks
- **Offline-first PWA** — installable, works without internet after first visit
- **3 languages** — Spanish, English, Catalan (auto-detected from browser)
- **Synthesized audio** — sound effects via Web Audio API, zero audio files
- **Accessible** — keyboard navigation (1–4 keys), `prefers-reduced-motion` respected, AA contrast

---

## Game modes

| Mode | Description | Win condition |
|------|-------------|---------------|
| **Swordsman** | 10 questions, no time limit | All 10 answered |
| **Gear Second** | 10 questions, 15 s each, 1 life | All 10 answered |
| **Survival** | Infinite questions, 3 lives | Last as long as possible |
| **Storm** | 10 questions, 8 s each, ×2 points | All 10 answered |
| **VS AI** | 10 questions vs a One Piece character | More correct answers |
| **Local Duel** | 10 questions each, pass the device | More correct answers |
| **Time Trial** | Infinite questions in 60 seconds | Most correct answers |
| **Practice** | Infinite questions, chosen operation | No end — exit when done |

---

## Daily Challenge

Every day all players worldwide receive the same 5 questions, generated deterministically from the date (`YYYYMMDD` seed via mulberry32). Results earn a **×3 Berry multiplier**. Completing the challenge on consecutive days builds a **daily streak**, which unlocks the `📅 7-Day Streak` and `🌟 30-Day Streak` achievements.

---

## Math levels

| # | Name | Operations | Berries to unlock |
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
| RNG | mulberry32 seeded PRNG for deterministic daily questions |
| Tests | Vitest (60 tests) |

---

## Project structure

```
src/
├── audio/          Web Audio API sound engine
├── components/     Shared UI (AnswerButton, QuestionCard, HpBar, …)
├── config/         Game configuration (levels, bots, achievements, daily)
├── engine/         Pure-TS question generator + seeded RNG
├── i18n/           Translations (es / en / ca)
├── screens/        Full-screen views (Hub, Game, Results, Ranking)
├── store/          Zustand stores (game, profile, settings)
└── utils/          Rank system helpers
```

---

## Development

```bash
npm install
npm run dev        # Vite dev server
```

```bash
npm run test       # Vitest — 60 tests, must pass before any commit
npm run type-check # tsc --noEmit
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Question engine

The engine is pure TypeScript — no React, no side effects. Every question is generated algorithmically at runtime: no pre-written question banks. It accepts an optional seeded RNG (`RNG = () => number`) so the Daily Challenge can produce identical questions for every player.

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
