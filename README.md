# 🎷 Tetris 1920 — The Roaring Blocks

> *"So we beat on, blocks against the current, borne back ceaselessly into the board."*
> — F. Scott Fitzgerald (probably)

A fully-featured **1920s Art Deco Tetris** clone built with **Angular 17**, using the **Web Audio API** for procedural jazz music — no external audio files required.

---

## ✨ Features

- 🎨 **Full Art Deco visual theme** — Cinzel Decorative fonts, gold palette, ornate panels, corner accents
- 🎷 **Procedural Jazz music** — Generated live with Web Audio API (stride bass + chord stabs)
- 🎮 **Single & Two-Player** modes with split-screen layout
- 👤 **4 unique avatars** — Gatsby, La Flapper, The Jazzman, The Bootlegger
- 🏆 **14 themed achievements** — with zoom-in fanfare overlay + confetti animation
- ⚙️ **Settings panel** — Music/SFX volume, 3 difficulty levels, ghost piece toggle, grid toggle
- 📊 **Scoreboard** — Top 20 scores per mode, with duration and date
- 👻 **Ghost piece** — Shows landing position
- 🔄 **Piece Hold** — Hold a piece for later
- 🔁 **SRS Wall Kicks** — Standard Rotation System with proper wall kicks
- 🎰 **7-bag randomizer** — No more droughts of your favourite piece
- ⌨️ **Auto-repeat** — Smooth held-key movement
- 📱 **Responsive** — Works on any modern browser

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
# → Open http://localhost:4200
```

### Build for production

```bash
npm run build:prod
# Output: dist/tetris-1920/
```

---

## 🎮 Controls

### Player 1
| Key | Action |
|-----|--------|
| `←` `→` | Move left / right |
| `↓` | Soft drop |
| `↑` | Hard drop |
| `X` | Rotate clockwise |
| `Z` | Rotate counter-clockwise |
| `Left Shift` | Hold piece |
| `Esc` | Pause / Resume |

### Player 2 (2-player mode)
| Key | Action |
|-----|--------|
| `A` `D` | Move left / right |
| `S` | Soft drop |
| `W` | Hard drop |
| `G` | Rotate clockwise |
| `F` | Rotate counter-clockwise |
| `Right Shift` | Hold piece |

---

## 🏗️ Architecture

```
src/app/
├── core/
│   ├── models/
│   │   ├── tetromino.model.ts      — 7 pieces, rotations, colors
│   │   ├── player.model.ts         — Player & avatar definitions
│   │   ├── game-state.model.ts     — Board, cell, game status
│   │   ├── score.model.ts          — Score, line points table
│   │   ├── settings.model.ts       — Settings, difficulty, drop speed
│   │   └── achievement.model.ts    — 14 achievements with rarity
│   └── services/
│       ├── game-engine.service.ts  — Main game loop & state (OCP)
│       ├── tetromino.service.ts    — Factory + 7-bag + SRS kicks
│       ├── collision.service.ts    — Board collision detection (SRP)
│       ├── score.service.ts        — Score calculation + persistence (SRP)
│       ├── achievement.service.ts  — Achievement checks + unlock stream
│       ├── audio.service.ts        — Procedural jazz (Web Audio API)
│       ├── input.service.ts        — Keyboard bindings + auto-repeat
│       ├── settings.service.ts     — Settings state (BehaviorSubject)
│       ├── storage.service.ts      — localStorage abstraction (SRP)
│       └── timer.service.ts        — Elapsed time ticker
├── shared/
│   ├── components/
│   │   └── art-deco-button/        — Reusable gold button component
│   └── pipes/
│       └── title-case.pipe.ts
└── features/
    ├── menu/
    │   ├── main-menu/              — Landing screen with jazz notes
    │   ├── player-select/          — Name + avatar picker
    │   ├── settings/               — Volume, difficulty, display
    │   └── scoreboard/             — High scores + achievements
    └── game/
        ├── game/                   — Container: orchestrates everything
        ├── game-board/             — Canvas renderer (30px cells)
        ├── game-panel/             — Score, level, lines, combo
        ├── next-piece/             — Canvas preview for next/hold
        ├── achievement-overlay/    — Zoom-in award popup
        └── pause-overlay/          — Intermission screen
```

### SOLID Principles Applied

| Principle | How |
|-----------|-----|
| **S** — SRP | `CollisionService`, `ScoreService`, `StorageService` each do one thing |
| **O** — OCP | `GameEngineService` open for new modes, closed to modification |
| **L** — LSP | Components accept `PlayerGameState` interface, not concrete classes |
| **I** — ISP | Separate `@Input()` bindings, no fat interfaces |
| **D** — DIP | All services injected via Angular DI, never `new`'d manually |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary font | Cinzel Decorative (titles) |
| Body font | Josefin Sans |
| Accent font | Dancing Script (subtitles) |
| Gold | `#D4AF37` |
| Noir | `#0D0900` |
| Teal (I piece) | `#17A398` |
| Crimson (T piece) | `#8B0000` |

---

## 🔊 Audio

All music and sound effects are generated procedurally at runtime using the **Web Audio API**. The jazz sequencer plays a 1920s-style chord progression (C7 → F7 → G7 → Am) with stride bass and chord stabs, humanized with random detuning.

No audio files are bundled — the game works fully offline after the first page load.

---

## 📜 License

MIT — swing freely, old sport.
