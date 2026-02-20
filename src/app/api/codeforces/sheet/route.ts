import { NextResponse } from "next/server";

interface CfProblem {
  contestId: number;
  index:     string;
  name:      string;
  rating?:   number;
  tags:      string[];
}

interface CfSubmission {
  verdict:  string;
  problem?: { contestId: number; index: string };
}

let problemsetCache: CfProblem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

const LADDER_RANGES: Record<string, { min: number; max: number }> = {
  div2a: { min: 800,  max: 1000 },
  div2b: { min: 1000, max: 1200 },
  div2c: { min: 1200, max: 1400 },
  div2d: { min: 1400, max: 1600 },
  div2e: { min: 1600, max: 1900 },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { handle, ladderId } = body;

    if (!ladderId || !LADDER_RANGES[ladderId]) {
      return NextResponse.json({ error: "Invalid ladder ID" }, { status: 400 });
    }

    // 1. Fetch user solved problems for green checkmarks
    const solvedSet = new Set<string>();
    if (handle) {
      try {
        const statusRes = await fetch(
          `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
        );
        const statusData = await statusRes.json();
        if (statusData.status === "OK") {
          statusData.result.forEach((sub: CfSubmission) => {
            if (sub.verdict === "OK" && sub.problem) {
              solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
          });
        }
      } catch (e) {
        console.warn("Could not fetch user status:", e);
      }
    }

    // 2. Fetch global problemset (cached)
    const now = Date.now();
    if (!problemsetCache || now - lastFetchTime > CACHE_DURATION) {
      try {
        const pRes = await fetch("https://codeforces.com/api/problemset.problems");
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

    // 3. Filter and select problems for the ladder
    const { min, max } = LADDER_RANGES[ladderId];

    const ladderProblems = problemsetCache
      .filter(
        (p: CfProblem) =>
          p.rating !== undefined &&
          p.rating >= min &&
          p.rating <= max &&
          p.contestId < 2000 // Only regular contests, not educational/gym
      )
      .sort((a: CfProblem, b: CfProblem) => a.contestId - b.contestId) // Classic A2OJ: oldest first
      .slice(0, 100)
      .map((p: CfProblem) => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        tags: p.tags || [],
        solved: solvedSet.has(`${p.contestId}-${p.index}`),
      }));

    return NextResponse.json({ problems: ladderProblems });
  } catch (error) {
    console.error("Sheet API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
