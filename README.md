# CP Tracker — AI-Powered Competitive Programming Coach

> A full-stack performance dashboard that aggregates data from **Codeforces** and **LeetCode**, analyses skill gaps at the topic level, and generates personalised AI coaching reports — like having a professional CP coach in your corner.

**Repo**: [github.com/Akashthespidy/cp-tracker](https://github.com/Akashthespidy/cp-tracker)

---

## ✨ What It Does

Enter your Codeforces handle or LeetCode username and instantly get:

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Rating history chart, contest results, problem distribution, and topic mastery visualisations |
| **AI Coaching Report** | GPT-powered weakness analysis, 30-day training plan, contest strategy, and targeted problem recommendations |
| **Goal Tracker** | Set a custom target rating — the AI coach optimises its plan to get you there |
| **Head-to-Head Compare** | Compare two Codeforces profiles side-by-side with radar charts |
| **Practice Sheets** | Curated problem ladders (A2OJ-style) with per-problem solved tracking |
| **Cross-Platform Stats** | Aggregate solve counts across CF, LC, CodeChef, and AtCoder in one view |
| **Saved Profiles** | Auto-saved profiles let you switch between accounts instantly from the homepage |

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **AI** | OpenAI GPT-3.5-turbo (server-side only) |
| **State** | Jotai (atomic state with localStorage persistence) |
| **Forms** | React Hook Form + Zod |
| **Package Manager** | pnpm |

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/Akashthespidy/cp-tracker.git
cd cp-tracker

# 2. Install
pnpm install

# 3. Configure environment
cp .env.example .env
# Add your OpenAI key:  OPENAI_API_KEY=sk-...
# (optional — app works without it using fallback coaching)

# 4. Run
pnpm dev
# → http://localhost:3000
```

---

## 🧠 Architecture

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── codeforces/          # CF profile, coach, compare, practice sheet routes
│   │   ├── leetcode/            # LC profile + coach routes
│   │   └── stats/               # Cross-platform aggregate stats
│   ├── codechef/                # CodeChef dashboard page
│   ├── compare/                 # Head-to-head comparison page
│   ├── leetcode/                # LeetCode dashboard page
│   ├── practice/                # Practice sheets page
│   ├── stats/                   # Global stats page
│   └── page.tsx                 # Homepage (platform selector + saved profiles)
├── components/
│   ├── dashboard/
│   │   ├── cf/                  # Codeforces-specific sub-components
│   │   ├── lc/                  # LeetCode-specific sub-components
│   │   ├── shared/              # Shared dashboard components
│   │   ├── CoachView.tsx        # CF AI coach (cached)
│   │   ├── LeetCodeDashboard.tsx # LC dashboard + AI coach (cached)
│   │   ├── PlatformDashboard.tsx # CF dashboard orchestrator
│   │   └── ...                  # Charts, goals, practice sheets
│   ├── ui/                      # shadcn/ui primitives
│   └── Navbar.tsx               # Global navigation
└── lib/
    ├── store.ts                 # Jotai atoms (handles, goals, coach cache, saved profiles)
    ├── rate-limit.ts            # Shared rate-limiting utility
    └── utils.ts                 # Tailwind merge helper
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Server-side AI** | `OPENAI_API_KEY` is a plain env var (not `NEXT_PUBLIC_`), so it's only accessible in API routes — never bundled into client JS |
| **Multi-layer caching** | Server: in-memory cache (10-30 min) prevents upstream rate limits. Client: localStorage cache for AI reports avoids redundant API + OpenAI calls |
| **Rate limiting** | Custom per-IP sliding window limiter on all API routes (10 req/min for data, 5 req/min for coach) prevents upstream platform bans |
| **Derived URL for internal fetch** | LC coach calls the LC data route internally via `new URL(req.url).origin` — works in dev, staging, and prod without config changes |
| **AI prompt with raw data** | The model receives the full topic breakdown and decides which topics are weak relative to the target — not pre-filtered, so it applies contextual judgement |
| **Graceful degradation** | If OpenAI is unavailable, both coach routes generate deterministic structured coaching text from the same data — same 5-section format, UI never breaks |
| **Jotai atomic state** | `atomWithStorage` for handles, goals, and coach cache gives localStorage persistence with zero boilerplate |

### Data Flow

```
User enters handle
      │
      ▼
[Homepage / LC Page]  ──saves to──▶  savedProfilesAtom (localStorage)
      │
      ▼
[Dashboard Component]
      │
      ├──▶ GET /api/codeforces?handle=...  ──▶ Codeforces API (3 endpoints)
      │         └─ Server cache (10 min) + rate limit (10 req/min)
      │
      ├──▶ GET /api/leetcode?username=...  ──▶ LeetCode GraphQL API
      │         └─ Server cache (30 min) + rate limit (10 req/min)
      │
      └──▶ POST /api/{platform}/coach     ──▶ OpenAI GPT-3.5-turbo
                └─ Rate limit (5 req/min)
                └─ Response cached in localStorage (24h staleness)
```

---

## ✅ Feature Details

### 🏆 Codeforces Dashboard
- Fetches live data from the Codeforces public API: user info, rating history, last 10,000 submissions
- Computes tag-level solved counts across 14+ categories (DP, graphs, greedy, etc.)
- Interactive rating history chart + problem distribution by rating bucket
- Skill distribution chart with weak tags highlighted in red vs strong in blue
- Recent contest history with per-round rating deltas

### 💻 LeetCode Dashboard
- Fetches data via the LeetCode GraphQL API with 30-minute server-side caching
- Parses `tagProblemCounts` across fundamental / intermediate / advanced tiers
- Difficulty breakdown (Easy/Medium/Hard) donut chart + top topics bar chart
- Topic mastery radial progress visualisation
- Recent accepted submissions list

### 🤖 AI Coach (Both Platforms)
- Analyses the full topic breakdown, current rating/level, and target goals
- Generates a structured 5-section report: **Where You Stand → Weak Spots → 30-Day Plan → Contest Strategy → Coach's Secret Tip**
- **Cached locally** — returns instantly on revisits; "Regenerate" button for fresh reports
- Shows report age ("Generated 3h ago") with stale indicator after 24 hours
- Falls back to deterministic coaching if OpenAI is unavailable

### ⚔️ Head-to-Head Comparison
- Compare two Codeforces handles: rating, solved count, tag distribution
- Radar chart overlay showing relative strengths

### 📚 Practice Sheets (A2OJ Ladders)
- Curated problem lists per rating range (Div2 A through Div2 E)
- Per-problem solved tracking synced with Codeforces submissions

### 👤 Saved Profiles
- Profiles auto-saved when users connect a handle
- Visible on the homepage for one-click access
- Works across Codeforces and LeetCode

### 🚦 Rate Limiting & Caching
- **Server-side**: Per-IP sliding window rate limiters on all API routes
- **Server-side**: In-memory response caches (10-30 min) reduce upstream API calls
- **Client-side**: AI coach data cached in localStorage (24h staleness threshold)

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Optional | OpenAI API key for AI coaching. Without it, the app generates deterministic coaching text |

---

## 📜 Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

---

## 📄 License

MIT

---

*Built with Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · Framer Motion · Jotai · OpenAI*
