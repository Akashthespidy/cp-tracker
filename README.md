# CP Tracker

A modern Competitive Programming tracker built with Next.js, shadcn/ui, and Recharts.

## Features

- **Multi-Platform Support**: Track Codeforces, LeetCode, CodeChef, and AtCoder.
- **Dynamic Dashboards**:
  - Unique visualizations per platform (Bar charts vs Pie charts).
  - Theme colors matching each platform's branding.
- **Goal Setting**:
  - Set rating goals (e.g., 1200 -> 1400).
  - Receive problem recommendations based on your current level.
- **Analytics**:
  - Interactive Rating Graphs.
  - Problem Difficulty Distribution.
  - Contest History with rating changes.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Browser**:
    Navigate to `http://localhost:3000`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Customization

- Edit `src/lib/mockdata.ts` to hook up real API endpoints.
- Edit `src/components/dashboard/PlatformDashboard.tsx` to add more platform-specific widgets.
