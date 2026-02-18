
import { NextResponse } from "next/server";

// Hardcoded Problem Sets similar to A2OJ Ladders
// Each ladder is a list of (ContestId, Index) pairs
// In a real app, this would be a JSON file or database table.
// Source for typical A2OJ Ladder content (approximate for demo)

const LADDERS_DATA: Record<string, { contestId: number; index: string }[]> = {
  div2a: [
    { contestId: 4, index: "A" }, { contestId: 71, index: "A" }, { contestId: 112, index: "A" }, { contestId: 231, index: "A" }, { contestId: 158, index: "A" },
    { contestId: 1, index: "A" }, { contestId: 50, index: "A" }, { contestId: 282, index: "A" }, { contestId: 263, index: "A" }, { contestId: 266, index: "A" },
    { contestId: 281, index: "A" }, { contestId: 339, index: "A" }, { contestId: 236, index: "A" }, { contestId: 118, index: "A" }, { contestId: 96, index: "A" },
    { contestId: 59, index: "A" }, { contestId: 791, index: "A" }, { contestId: 617, index: "A" }, { contestId: 677, index: "A" }, { contestId: 546, index: "A" },
    { contestId: 41, index: "A" }, { contestId: 734, index: "A" }, { contestId: 271, index: "A" }, { contestId: 110, index: "A" }, { contestId: 69, index: "A" },
    { contestId: 116, index: "A" }, { contestId: 266, index: "B" }, { contestId: 200, index: "B" }, { contestId: 158, index: "B" }, { contestId: 32, index: "B" },
    // Add more to reach 100... simulating a large set
    // For brevity, I'll repeat a pattern or fetch real recent ones in a loop if I could, but static list is safer for "A2OJ style"
    // Let's stick to ~30 for the demo to ensure they load fast
  ],
  div2b: [
    { contestId: 200, index: "B" }, { contestId: 266, index: "B" }, { contestId: 339, index: "B" }, { contestId: 492, index: "B" }, { contestId: 520, index: "B" },
    { contestId: 746, index: "B" }, { contestId: 158, index: "B" }, { contestId: 32, index: "B" }, { contestId: 977, index: "C" }, { contestId: 4, index: "C" },
  ],
  // ... others can be added
};

// Fill up ladders with dynamic recent problems so user sees 100 as promised?
// Or better: Use the API to fetch problemset and FILTER exactly 100 problems valid for that ladder definition.
// User wants A2OJ style -> usually means specific static list.
// BUT user also said "it says 100 problems but not 100".
// So let's maximize the list.

// Let's implement a robust fetcher that ensures we get 100 problems per ladder.
// We will filter the global problemset by rating to simulate A2OJ ladders if we don't have the full static list.

let problemsetCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export async function POST(request: Request) {
  try {
    const { handle, ladderId } = await request.json();
    
    // 1. Fetch User Solved Problems (For green checks)
    // To speed up: fetch simpler API or just status
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`);
    const statusData = await statusRes.json();
    const solvedSet = new Set<string>();
    
    if (statusData.status === 'OK') {
        statusData.result.forEach((sub: any) => {
            if (sub.verdict === 'OK' && sub.problem) {
                solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
        });
    }

    // 2. Fetch Global Problemset (Cached)
    const now = Date.now();
    if (!problemsetCache || (now - lastFetchTime > CACHE_DURATION)) {
      try {
        const pRes = await fetch('https://codeforces.com/api/problemset.problems');
        const pData = await pRes.json();
        if (pData.status === "OK") {
            problemsetCache = pData.result.problems;
            lastFetchTime = now;
        }
      } catch (e) {
        console.error("Problemset fetch failed:", e);
      }
    }

    if (!problemsetCache) {
      return NextResponse.json({ error: "Failed to fetch problemset" }, { status: 500 });
    }

    // 3. Define Ladder Logic (A2OJ Simulation via Rating)
    let minRating = 800;
    let maxRating = 900;
    let count = 100;

    switch(ladderId) {
        case 'div2a': minRating = 800; maxRating = 1100; break;
        case 'div2b': minRating = 1100; maxRating = 1300; break;
        case 'div2c': minRating = 1300; maxRating = 1500; break;
        case 'div2d': minRating = 1500; maxRating = 1800; break;
        case 'div2e': minRating = 1800; maxRating = 2100; break;
    }

    // 4. Select Problems
    // Strategy: Prefer older problems? Or balanced? A2OJ is usually older.
    // Let's pick highly solved problems in that range (Proxy for "Good/Standard" problems)
    // Since we don't have solved count in `problemset.problems` (it's in `problemStatistics` but that's a separate fetch),
    // we will sort by Contest ID (Old to New) to simulate "Classic" ladder feel? Or Random?
    // Let's filter by rating and take first 100 that match.
    
    const ladderProblems = problemsetCache
        .filter((p: any) => p.rating >= minRating && p.rating <= maxRating)
        // A2OJ usually has static list. To mimic "Ladders", let's sort by ID to get "Classic" problems first (often lower contest IDs)
        // Actually, mixing them is better. Let's take the *most recent* ones for "Updated A2OJ"?
        // Or strictly older ones. Let's stick to a mix or standard Sort.
        .sort((a, b) => a.contestId - b.contestId) // Oldest first = Classic A2OJ feel
        .slice(0, 100) // EXACTLY 100 items if available
        .map((p: any) => ({
            ...p,
            solved: solvedSet.has(`${p.contestId}-${p.index}`)
        }));

    return NextResponse.json({
        problems: ladderProblems
    });

  } catch (error) {
    console.error("Sheet API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
