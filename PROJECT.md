# CP Tracker — Competitive Programming Coach

> A full-stack AI-powered performance dashboard for competitive programmers, providing real-time statistics, weakness analysis, and personalized coaching plans across Codeforces and LeetCode.

**Live**: [cp-tracker.vercel.app](https://github.com/Akashthespidy/cp-tracker) &nbsp;·&nbsp; **Repo**: [github.com/Akashthespidy/cp-tracker](https://github.com/Akashthespidy/cp-tracker)

---

## Overview

CP Tracker is a full-stack Next.js 15 application that aggregates competitive programming data from external APIs, analyses skill gaps, and generates personalized AI coaching reports — functioning like a personal trainer for competitive programmers.

Users enter their Codeforces handle or LeetCode username and instantly receive:
- A live dashboard of their rating history, contest results, and problem-solving statistics
- An AI-generated coaching report that identifies their weakest topics, builds a 30-day training plan, and gives a targeted problem recommendation list
- A goal tracker that lets them set a custom target rating and tracks progress toward the next rank tier

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **AI** | OpenAI GPT-3.5-turbo (server-side only) |
| **State** | React hooks (useState, useEffect) |
| **Forms** | React Hook Form + Zod |
| **Package Manager** | pnpm |

---

## Features

### 🏆 Codeforces Dashboard
- Fetches live data from the **Codeforces public API**: user info, rating history, last 2 000 submissions
- Computes **tag-level solved counts** across 14 common categories (dp, graphs, greedy, etc.)
- Renders an **interactive rating history chart** (Recharts line chart) and **problem distribution bar chart** by rating bucket
- Displays a **skill distribution chart** with weak tags highlighted in red vs strong in blue
- Shows **recent contest history** with rating delta per round

### 🤖 Codeforces AI Coach
- Posts all tag counts, current rating, peak rating, and target rating to a **Next.js API route**
- Filters and scores **up to 15 unsolved problems** from the full CF problemset (cached server-side for 1 hour) that fall within the user's rating range, prioritising weak-tag overlap
- Calls **OpenAI GPT-3.5-turbo** (server-side, key never exposed to client) with the full raw tag table — the AI independently decides which topics are weak relative to the target rating gap, rather than being pre-told
- Returns a **5-section structured coaching report**: WHERE YOU STAND · CRITICAL WEAK SPOTS · 30-DAY BATTLE PLAN · CONTEST STRATEGY · COACH'S SECRET TIP
- The report is parsed and rendered as **individual styled cards** with matching icons and color themes
- The user's **Goal Tracker** target rating is wired through from `GoalStatus` → `PlatformDashboard` → `CoachView` → API via lifted state, so changing the goal in the sidebar instantly changes what the next coaching report will optimise for
- Recommended problems support **"View More" pagination** (5 shown by default, expandable in batches of 5, up to 15 total)
- All weak-topic badges are **clickable links** to the CF problemset filtered by that exact tag

### 💻 LeetCode Dashboard
- Fetches data via the **LeetCode GraphQL API** (30-minute server-side in-memory cache to avoid rate limiting)
- Parses `tagProblemCounts` across fundamental / intermediate / advanced tiers and computes solved counts per important topic
- Renders rating history, recent accepted submissions, and **topic distribution charts**

### 🤖 LeetCode AI Coach
- Sends the full tag breakdown, difficulty stats, contest rating, and acceptance rate to OpenAI
- AI independently identifies weak spots from the raw data relative to the Easy/Medium/Hard goals
- Same **5-section coaching report** format as the CF coach, parsed into colour-coded section cards
- Includes **topic-based problem recommendations** linking directly to LeetCode tag pages
- Handles `tagProblemCounts: null` gracefully (occurs when LeetCode rate-limits the GraphQL endpoint) — no crash, falls back cleanly to static coaching

### ⚔️ Head-to-Head Comparison
- Compare two Codeforces handles side-by-side across rating, solved count, tag distribution
- Radar chart overlay showing relative strengths and weaknesses

### 📚 Practice Sheets
- Curated problem lists organised by topic and difficulty tier
- Track-your-own progress checklist per sheet

### 🎯 Goal Tracker
- User-editable target rating input with live progress bar
- Automatically initialises to the next natural rank milestone on first load
- Propagates changes upward to synchronise the AI coach's target in real time

---

## Architecture Highlights

### Server-Side AI (Secure by Design)
The `OPENAI_API_KEY` is a plain (non-`NEXT_PUBLIC_`) environment variable, making it accessible **only in API routes**, never bundled into the client JavaScript. Both coach routes are `POST` handlers in `src/app/api/`.

### Self-Referential Internal Fetch (Robust URL Resolution)
The LeetCode coach route calls the LeetCode data route internally to reuse its 30-minute cache. The base URL is derived directly from the **incoming request's `origin`** (`new URL(req.url).origin`) rather than a hardcoded env var, ensuring it resolves correctly in development (localhost:3000), staging, and production without any configuration changes.

### Codeforces Problemset Cache
The full Codeforces problemset (~9 000 problems) is fetched once and cached in-process for 1 hour. Recommendation filtering and weak-tag scoring run purely in memory against this cache, making the coach response fast after the first call.

### Lifted Goal State
The user's target rating is managed as shared state in `PlatformDashboard` — the parent of both `GoalStatus` and `CoachView`. An `onGoalChange` callback in `GoalStatus` propagates edits upward, ensuring both components always see the same value.

### Graceful Degradation
If the OpenAI API is unavailable, both coach routes fall back to a deterministic, structured coaching text generated from the same underlying data — the same 5-section format, so the UI never breaks.

---

## Engineering Decisions

| Decision | Rationale |
|---|---|
| **App Router over Pages Router** | Enables React Server Components, simplified layouts, and collocated API routes |
| **In-memory caching over Redis** | Zero-infrastructure caching sufficient for a portfolio project; easy to swap for Redis/KV on scale |
| **AI prompt with raw data instead of pre-filtered tags** | Lets the model apply contextual judgement (e.g., 5 DP solves is only weak if the user is targeting Expert+) rather than blindly picking lowest counts |
| **Derived URL for internal fetch** | Eliminates a class of bugs where `NEXT_PUBLIC_APP_URL` is wrong in different environments |
| **shadcn/ui component library** | Accessible, unstyled-first components that compose cleanly with Tailwind without fighting the design system |

---

## CV One-Liner

> **CP Tracker** — Full-stack Next.js 15 app integrating Codeforces & LeetCode APIs with an OpenAI-powered AI coaching engine that analyses topic-level skill gaps and generates personalised 30-day training plans; features live rating charts (Recharts), server-side API key security, in-memory problemset caching, and a linked goal-tracking system.

---

## Running Locally

```bash
git clone https://github.com/Akashthespidy/cp-tracker.git
cd cp-tracker
pnpm install

# Create .env
echo "OPENAI_API_KEY=sk-..." > .env

pnpm dev
# → http://localhost:3000
```

---

*Built with Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Framer Motion · OpenAI*
