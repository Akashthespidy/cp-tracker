
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Load configuration
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy", // Fallback to dummy if not set
});


interface CfProblem {
  contestId: number;
  index:     string;
  name:      string;
  rating?:   number;
  tags:      string[];
}

interface CfSubmission {
  verdict:  string;
  problem?: { contestId: number; index: string; tags: string[] };
}

// Cache for problemset to avoid fetching every time within instance
let problemsetCache: CfProblem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function POST(request: Request) {
  try {
    const { handle, goal } = await request.json();

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    // 1. Fetch User Info & Rating
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const infoData = await infoRes.json();
    if (infoData.status !== "OK") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = infoData.result[0];
    const currentRating = user.rating || 800;
    const targetRating = goal || (currentRating + 200);

    // 2. Fetch User Submissions (All to get accurate solved list)
    // Limit to 2000 for performance
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=2000`);
    const statusData = await statusRes.json();
    
    if (statusData.status !== "OK") {
      // Allow partial failure? No, analysis needs submissions.
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    const solvedProblems = new Set<string>();
    const tagCounts: Record<string, number> = {};
    
    statusData.result.forEach((sub: CfSubmission) => {
      if (sub.verdict === 'OK' && sub.problem && sub.problem.tags) {
        const id = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(id)) {
            solvedProblems.add(id);
            sub.problem.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
      }
    });

    // 3. Fetch Problemset (With basic in-memory caching)
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
      return NextResponse.json({ error: "Failed to fetch problemset for recommendations" }, { status: 500 });
    }

    // 4. Analysis: Identify Weaknesses
    // Simple logic: Least solved tags relative to total problems?
    // Or just absolute lowest counts among standard tags?
    // Let's filter for common tags to avoid obscure ones being "weak" just because they are rare.
    const COMMON_TAGS = ["dp", "greedy", "graphs", "math", "constructive algorithms", "implementation", "brute force", "sortings", "data structures", "binary search", "dfs and similar", "trees", "number theory", "strings"];
    
    const weakTags = COMMON_TAGS
        .map(tag => ({ tag, count: tagCounts[tag] || 0 }))
        .sort((a, b) => a.count - b.count) // Ascending count = fewest solved
        .slice(0, 5) // Bottom 5
        .map(t => t.tag);

    // 5. Recommendations
    const recommendations = problemsetCache
      .filter((p: CfProblem) => {
        return (
          p.rating !== undefined &&
          p.rating >= currentRating &&
          p.rating <= targetRating + 100 &&
          !solvedProblems.has(`${p.contestId}-${p.index}`)
        );
      })
      .map((p: CfProblem) => {
        let score = 0;
        // Prioritize problems with weak tags
        const hasWeakTag = p.tags.some((t: string) => weakTags.includes(t));
        if (hasWeakTag) score += 10;
        
        // Prioritize distinct problems (not too many from same contest? unlikely to matter much here)
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score || (a.rating ?? 0) - (b.rating ?? 0)) // Descending score, then easier rating first
      .slice(0, 5); // Return top 5

    // 6. AI Suggestion Generation
    let aiAdvice = "";
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `
          You are a competitive programming coach for user ${handle}.
          Current Rating: ${currentRating}. Target: ${targetRating}.
          
          Solved Tag Distribution (Top 5 Weakest Common Tags):
          ${weakTags.join(', ')}

          Recommended Problems to Solve:
          ${recommendations.map((p: CfProblem) => `- ${p.name} (${p.rating}) [${p.tags.join(', ')}]`).join('\n')}

          Provide a short, structured training plan. Explain WHY these tags strictly (2 sentences). Then give 3 validation tips for the recommended problems.
        `;

        const completion = await client.chat.completions.create({
          messages: [{ role: "system", content: "You are a concise, motivating CP coach." }, { role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
        });

        aiAdvice = completion.choices[0].message.content || "No advice generated.";
      } catch (err: unknown) {
        console.error("OpenAI API Error:", err instanceof Error ? err.message : err);
        aiAdvice = "AI service unavailable. Focus on the recommended problems leveraging the weak tags identified above.";
      }
    } else {
        // Fallback simulated advice
        const weakStr = weakTags.join(', ');
        aiAdvice = `(Simulated AI) Your analysis indicates potential gaps in: ${weakStr}. To reach ${targetRating}, focus on solving problems in the ${currentRating}-${targetRating} range specifically targeting these topics. The recommended set above prioritizes these tags to balance your skill set.`;
    }

    return NextResponse.json({
      tagCounts,
      weakTags,
      recommendations,
      aiAdvice
    });

  } catch (error) {
    console.error("Coach API Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
