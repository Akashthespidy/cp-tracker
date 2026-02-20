
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
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

// Codeforces rank tier labels
function getRankTier(rating: number): string {
  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2300) return "Master";
  if (rating < 2400) return "International Master";
  if (rating < 2600) return "Grandmaster";
  if (rating < 3000) return "International Grandmaster";
  return "Legendary Grandmaster";
}

// Cache for problemset to avoid fetching every time within instance
let problemsetCache: CfProblem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const COMMON_TAGS = [
  "dp", "greedy", "graphs", "math", "constructive algorithms",
  "implementation", "brute force", "sortings", "data structures",
  "binary search", "dfs and similar", "trees", "number theory", "strings",
];

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
    const currentRating  = user.rating    || 800;
    const maxRating      = user.maxRating || currentRating;
    const targetRating   = goal || (currentRating + 200);
    const currentTier    = getRankTier(currentRating);
    const targetTier     = getRankTier(targetRating);

    // 2. Fetch User Submissions (limit to 2000 for performance)
    const statusRes = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=2000`
    );
    const statusData = await statusRes.json();

    if (statusData.status !== "OK") {
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    const solvedProblems = new Set<string>();
    const tagCounts: Record<string, number> = {};

    statusData.result.forEach((sub: CfSubmission) => {
      if (sub.verdict === "OK" && sub.problem?.tags) {
        const id = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(id)) {
          solvedProblems.add(id);
          sub.problem.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    const totalSolved = solvedProblems.size;

    // 3. Fetch Problemset (with in-memory caching)
    const now = Date.now();
    if (!problemsetCache || now - lastFetchTime > CACHE_DURATION) {
      try {
        const pRes  = await fetch("https://codeforces.com/api/problemset.problems");
        const pData = await pRes.json();
        if (pData.status === "OK") {
          problemsetCache = pData.result.problems;
          lastFetchTime   = now;
        }
      } catch (e) {
        console.error("Problemset fetch failed:", e);
      }
    }

    if (!problemsetCache) {
      return NextResponse.json(
        { error: "Failed to fetch problemset for recommendations" },
        { status: 500 }
      );
    }

    // 4. Identify weak tags (server-side, used for UI coloring & recommendations)
    const weakTags = COMMON_TAGS
      .map(tag => ({ tag, count: tagCounts[tag] || 0 }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 5)
      .map(t => t.tag);

    // Full tag table sorted by solved count — passed raw to AI for its own analysis
    const fullTagTable = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => `${tag}: ${count} solved`)
      .join('\n');

    // 5. Recommendations
    const recommendations = problemsetCache
      .filter((p: CfProblem) =>
        p.rating !== undefined &&
        p.rating >= currentRating &&
        p.rating <= targetRating + 100 &&
        !solvedProblems.has(`${p.contestId}-${p.index}`)
      )
      .map((p: CfProblem) => ({
        ...p,
        score: p.tags.some((t: string) => weakTags.includes(t)) ? 10 : 0,
      }))
      .sort((a, b) => b.score - a.score || (a.rating ?? 0) - (b.rating ?? 0))
      .slice(0, 15);

    // 6. AI Advice Generation
    let aiAdvice = "";

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are a world-class competitive programming coach for Codeforces. You MUST speak directly to the athlete using "you" and "your" — never third person.

USER PROFILE:
- Handle: ${handle}
- Current Rating: ${currentRating} (${currentTier})
- Peak Rating: ${maxRating}
- Target Rating: ${targetRating} (${targetTier})
- Total Problems Solved: ${totalSolved}

FULL TOPIC BREAKDOWN (all topics the user has solved, sorted by count):
${fullTagTable}

RECOMMENDED PROBLEMS (unsolved, within their rating range):
${recommendations.map((p: CfProblem) => `- ${p.name} [${p.rating}] — tags: ${p.tags.join(", ")}`).join("\n")}

Based on the above raw data, YOU decide which topics are weak given their current rating (${currentRating}) and target rating (${targetRating}). A topic is weak if the user has solved too few problems in it relative to what someone at ${targetRating} typically needs. Do NOT just pick the lowest count — consider what topics are most critical at the ${currentRating}–${targetRating} rating range.

Write a direct, personal coaching report formatted EXACTLY like this:

🎯 WHERE YOU STAND
[2–3 sentences: honest tier assessment, note what they're good at from the data, what gap exists to reach ${targetTier}.]

⚠️ YOUR CRITICAL WEAK SPOTS
[From your analysis of the topic table, name the 2–3 topics most important to fix at this rating range. Explain WHY each one is critical for CF contests at ${currentRating}–${targetRating}. Mention their actual solved count from the data.]

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: [Specific focus — the most critical weak topic + daily problem count + rating band to target]
Week 3–4: [Next weak topic shift + push to harder problems approaching ${targetRating}]

🏆 CONTEST STRATEGY
[1–2 sentences on which CF divisions to enter and how many problems to aim for, based on current ${currentRating}.]

💡 COACH'S SECRET TIP
[One tactical, specific tip that directly addresses their biggest gap — something concrete, not generic.]

Keep under 300 words. Be direct and motivating like a real coach.`;

        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an elite, direct, and highly motivating Codeforces performance coach. You give brutally honest but encouraging feedback like a professional athletic coach. You always speak directly to the athlete using 'you/your'. You understand CF rating tiers deeply.",
            },
            { role: "user", content: prompt },
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 520,
          temperature: 0.8,
        });

        aiAdvice = completion.choices[0].message.content || "";
      } catch (err: unknown) {
        console.error("OpenAI API Error:", err instanceof Error ? err.message : err);
        aiAdvice = generateFallbackAdvice(
          handle, currentRating, maxRating, targetRating,
          currentTier, targetTier, totalSolved,
          weakTags, tagCounts, recommendations
        );
      }
    } else {
      aiAdvice = generateFallbackAdvice(
        handle, currentRating, maxRating, targetRating,
        currentTier, targetTier, totalSolved,
        weakTags, tagCounts, recommendations
      );
    }

    return NextResponse.json({
      tagCounts,
      weakTags,
      recommendations,
      aiAdvice,
      currentTier,
      targetTier,
      totalSolved,
      maxRating,
    });
  } catch (error) {
    console.error("Coach API Unhandled Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateFallbackAdvice(
  handle: string,
  currentRating: number,
  maxRating: number,
  targetRating: number,
  currentTier: string,
  targetTier: string,
  totalSolved: number,
  weakTags: string[],
  tagCounts: Record<string, number>,
  recommendations: CfProblem[],
) {
  const topWeak   = weakTags.slice(0, 3).map(t => `${t} (${tagCounts[t] || 0} solved)`);
  const strongStr = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([tag]) => tag)
    .join(" and ");
  const recNames  = recommendations.slice(0, 2).map(p => p.name).join(", ");

  return `🎯 WHERE YOU STAND
${handle}, you're currently rated ${currentRating} (${currentTier}) with ${totalSolved} problems solved — and your peak was ${maxRating}. Your strongest areas are ${strongStr}, which gives you a solid foundation. The gap to ${targetTier} (${targetRating}) is real, but absolutely closeable with focused work.

⚠️ YOUR CRITICAL WEAK SPOTS
Your most underdeveloped areas are ${topWeak.join(", ")}. These aren't optional — they appear in almost every CF round from Div. 2 Problem C onward. Without fixing these, your rating ceiling is lower than it needs to be.

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: Lock in on "${weakTags[0] || "dp"}" exclusively. Solve 2 problems daily in the ${currentRating}–${currentRating + 100} range. Start with: ${recNames || "problems from the recommended set above"}.
Week 3–4: Shift to "${weakTags[1] || "graphs"}" and push into the ${currentRating + 100}–${targetRating} rating band. Aim for 2–3 problems each day and attempt at least one virtual contest.

🏆 CONTEST STRATEGY
At ${currentRating} (${currentTier}), you should be competing in Div. 2 rounds every week. Your goal: consistently solve A + B + C in under 90 minutes. That alone will push your rating past ${currentRating + 100}.

💡 COACH'S SECRET TIP
Don't just submit — upsolve. After every contest, spend 30 minutes reading editorials for the first problem you couldn't solve. Over 30 days, this one habit is worth more than grinding 50 random problems.`;
}
