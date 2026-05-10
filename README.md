# Nakama Math

[![Deploy to GitHub Pages](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml/badge.svg)](https://github.com/ezar/nakama-math/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-offline--first-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-private-lightgrey)](#license)

A math practice PWA for kids with a One Piece theme. Players earn Berries, climb pirate ranks, and battle across ten game modes — all without an internet connection or user account.

**🌐 Live app: [ezar.github.io/nakama-math](https://ezar.github.io/nakama-math/)**

---

## Features

- **8 pirate ranks** — Grumete → Rey Pirata, unlocked by earning Berries
- **10 game modes** — relaxed, timed, survival, blitz, VS AI, local duel, time trial, practice, error drill, daily challenge
- **Daily Challenge** — same 5 questions worldwide each day (seeded RNG), ×3 Berry bonus, daily streak tracking
- **Streak multipliers** — ×1.2 at 3, ×2 at 5 (Gear Second), ×3 at 10
- **Error drill** — stores up to 50 wrong questions per profile; dedicated review mode replays them with fresh options
- **Power-ups** — spend Berries mid-game: ⏸ freeze timer (+5s), ✂️ eliminate 2 wrong options, ⏭ skip question
- **Berry Shop** — 12 premium emoji avatars purchasable with earned Berries
- **Streak Calendar** — 14-week activity heatmap (regular play + daily challenge highlighted separately)
- **Operation breakdown** — per-operation accuracy bars shown on the profile hub
- **VS AI** — challenge 4 One Piece characters (Chopper → Robin, 40 %–95 % accuracy)
- **Local Duel** — two players share the device, pass-and-play with full handoff screen
- **Error review** — collapsible post-game list of every wrong answer with the correct solution
- **6 player profiles** stored in `localStorage` — no account needed
- **13 achievements** — streaks, milestones, rank-ups, level unlocks, daily streaks
- **Settings screen** — language, sound, and input mode in one place
- **Onboarding tutorial** — 4-step illustrated intro for new profiles
- **Keyboard input mode** — type answers instead of tapping buttons
- **Offline-first PWA** — installable, works without internet after first visit
- **3 languages** — Spanish, English, Catalan (auto-detected, switchable in settings)
- **Synthesized audio** — sound effects via Web Audio API, zero audio files
- **Accessible** — keyboard shortcuts (1–4), `prefers-reduced-motion` respected

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
| **Time Trial** | Infinite questions in 60 seconds | Most correct |
| **Practice** | Infinite questions, chosen operation | No end — exit when done |
| **Error Drill** | Up to 10 stored wrong questions, no score | No end — review your mistakes |
| **Daily Challenge** | 5 fixed questions, ×3 bonus | Resets at midnight |

---

## Daily Challenge

Every day all players worldwide receive the same 5 questions, generated deterministically from the date (`YYYYMMDD` seed via mulberry32). Results earn a **×3 Berry multiplier**. Completing on consecutive days builds a **daily streak** tracked in the activity calendar.

---

## Math levels

| # | Rank name | Operations | Berries to unlock |
|---|-----------|-----------|-------------------|
| 1 | Grumete | + / − | 0 |
| 2 | Marinero | + / − (larger range) | 500 |
| 3 | Pirata | + / − / ×2 ×5 | 1 500 |
| 4 | Primer Oficial | Times tables ×2–×12 | 3 000 |
| 5 | Capitán | × / ÷ | 6 000 |
| 6 | Shichibukai | ÷ with multi-step | 12 000 |
| 7 | Yonko | Fractions · Percentages | 25 000 |
| 8 | Rey Pirata | Fractions · % · Exponents | 50 000 |

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
├── audio/          Web Audio API sound engine (zero audio files)
├── components/     Shared UI — AnswerButton, QuestionCard, ShopModal,
│                   StreakCalendar, HpBar, RankBadge, …
├── config/         Static config — levels, bots, achievements, daily challenge
├── engine/         Pure-TS question generator + seeded RNG
├── i18n/           Translations (es / en / ca)
├── screens/        Full-screen views — Hub, Game, Results, Ranking,
│                   Settings, Intro, Splash
├── store/          Zustand stores — gameStore, profileStore, settingsStore
└── utils/          Rank system helpers
```

---

## Development

```bash
npm install
npm run dev        # Vite dev server
```

```bash
npm run test       # Vitest — 60 tests
npm run type-check # tsc --noEmit
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Question engine

The engine is pure TypeScript — no React, no side effects. Every question is generated algorithmically at runtime: no pre-written question banks. It accepts an optional seeded RNG (`RNG = () => number`) so the Daily Challenge produces identical questions for every player on the same date.

Distractors are crafted per operation to be educationally meaningful:

| Operation | Decoy strategy |
|-----------|---------------|
| Add / Sub | ±1, ±10, transposed operands, confused with multiplication |
| Multiply | confused with addition (a+b), off-by-one table entries |
| Divide | dividend/divisor swapped, result ±quotient |
| Fraction | forgot to multiply, multiplied instead, wrong denominator |
| Percentage | divided by 10 instead of 100, forgot to divide |
| Exponent | confused with multiplication (a×b) |

The `makeErrorDrillQuestion` helper rebuilds a `Question` from a stored `StoredQuestion` (display + correct answer) by generating fresh plausible distractors without needing the original operands.

**Test invariants** (run against 500 samples per level):

- `allAnswers` always has exactly 4 unique entries
- The correct answer is always present in `allAnswers`
- Results are integers when `requireIntegerResults: true`
- No negative answers when `allowNegativeResults: false`

---

## Profile system

Each of the 6 local profiles persists:

| Field | Description |
|-------|-------------|
| `berries` | Currency earned from correct answers |
| `stats` | Total correct, attempted, best streak, games played |
| `operationStats` | Per-operation correct/attempted counts |
| `achievements` | Unlocked achievement IDs |
| `recentGames` | Last 10 games with mode, accuracy, berries |
| `activityDates` | Last 90 days played (YYYY-MM-DD, for the heatmap) |
| `wrongQuestions` | Up to 50 expressions answered incorrectly (for Error Drill) |
| `lastDailyDate` | Date of last completed daily challenge |
| `dailyStreak` | Consecutive daily challenge streak |
| `ownedAvatars` | Premium avatars purchased from the shop |
| `hasSeenTutorial` | Whether onboarding has been dismissed |

---

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that runs tests, builds the app, and deploys to GitHub Pages via the official `actions/deploy-pages` action.

**One-time setup:** GitHub → Settings → Pages → Source → **GitHub Actions**.

The build version (`yy.mm.dd.hhmm`) is injected at build time and shown in the footer.

---

## Adding a new level

1. Open `src/config/levels.ts`
2. Add a `LevelConfig` object to the `LEVELS` array with `xpToUnlock` and `operations`
3. If you introduce a new `Operation`, add generation logic to `QuestionEngine.ts` and tests to `QuestionEngine.test.ts`
4. Run `npm test` — all must pass
5. Done. HubScreen, RankingScreen, and the rank system pick it up automatically.

---

## License

Private project. All rights reserved.
