import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

// Weak tag thresholds per difficulty level
const IMPORTANT_TAGS_BY_TIER = {
  fundamental: ["array", "string", "hash-table", "math", "sorting", "greedy", "binary-search", "two-pointers"],
  intermediate: ["dynamic-programming", "depth-first-search", "breadth-first-search", "backtracking", "stack", "queue", "linked-list", "tree", "graph", "sliding-window", "prefix-sum"],
  advanced: ["segment-tree", "trie", "union-find", "topological-sort", "bit-manipulation", "monotonic-stack", "divide-and-conquer"],
};

export async function POST(req: Request) {
  try {
    const { username, goalMedium, goalHard } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Fetch user data from our own LeetCode route (has caching)
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/leetcode?username=${username}`);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    const user = data.matchedUser;
    const contestData = data.userContestRanking;

    // Parse solved counts
    const acStats: Record<string, number> = {};
    user.submitStats.acSubmissionNum.forEach((s: any) => {
      acStats[s.difficulty] = s.count;
    });

    const totalStats: Record<string, number> = {};
    user.submitStats.totalSubmissionNum.forEach((s: any) => {
      totalStats[s.difficulty] = s.count;
    });

    // Aggregate all tag counts
    const allTags: { tagName: string; tagSlug: string; problemsSolved: number; tier: string }[] = [];
    const { advanced, intermediate, fundamental } = user.tagProblemCounts;

    fundamental.forEach((t: any) => allTags.push({ ...t, tier: "fundamental" }));
    intermediate.forEach((t: any) => allTags.push({ ...t, tier: "intermediate" }));
    advanced.forEach((t: any) => allTags.push({ ...t, tier: "advanced" }));

    // Identify weak tags — ones with fewest problems relative to tier importance
    const easyCount = acStats["Easy"] || 0;
    const mediumCount = acStats["Medium"] || 0;
    const hardCount = acStats["Hard"] || 0;

    // Determine user level based on solved counts
    let userLevel: "beginner" | "intermediate" | "advanced" = "beginner";
    if (mediumCount > 50 || hardCount > 10) userLevel = "intermediate";
    if (mediumCount > 150 || hardCount > 50) userLevel = "advanced";

    // Pick relevant important tags based on level
    const relevantImportantTags = userLevel === "beginner"
      ? IMPORTANT_TAGS_BY_TIER.fundamental
      : userLevel === "intermediate"
        ? [...IMPORTANT_TAGS_BY_TIER.fundamental, ...IMPORTANT_TAGS_BY_TIER.intermediate]
        : [...IMPORTANT_TAGS_BY_TIER.intermediate, ...IMPORTANT_TAGS_BY_TIER.advanced];

    const tagMap = new Map(allTags.map(t => [t.tagSlug, t.problemsSolved]));

    const weakTags = relevantImportantTags
      .map(slug => ({ slug, solved: tagMap.get(slug) || 0 }))
      .sort((a, b) => a.solved - b.solved)
      .slice(0, 6)
      .map(t => t.slug);

    // Build recommendations (topic-based since LeetCode doesn't expose full unsolved problemset)
    const recommendations = weakTags.slice(0, 5).map(slug => {
      const difficulty = IMPORTANT_TAGS_BY_TIER.fundamental.includes(slug) ? "Easy/Medium"
        : IMPORTANT_TAGS_BY_TIER.intermediate.includes(slug) ? "Medium"
          : "Medium/Hard";

      return {
        topic: slug.replace(/-/g, " "),
        difficulty,
        url: `https://leetcode.com/tag/${slug}/`,
        solvedCount: tagMap.get(slug) || 0,
        suggestedCount: difficulty === "Easy/Medium" ? 20 : difficulty === "Medium" ? 15 : 10,
      };
    });

    // Build full tag distribution for chart
    const tagDistribution = allTags
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 15);

    // Generate AI advice
    let aiAdvice = "";
    const targetMedium = goalMedium || mediumCount + 25;
    const targetHard = goalHard || hardCount + 10;

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are a LeetCode coach for user ${username}.
Solved: Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}.
Contest Rating: ${contestData?.rating ? Math.round(contestData.rating) : "N/A"}.
Weak Topics (by tag slug): ${weakTags.join(", ")}.
Goal: Medium ${targetMedium}, Hard ${targetHard}.

Write a concise, actionable 30-day improvement plan:
1. Which 3 topics to focus on first and why
2. Daily study routine (problems per day, difficulty mix)
3. Contest preparation tip
Keep it under 200 words, motivating, and specific.`;

        const completion = await client.chat.completions.create({
          messages: [
            { role: "system", content: "You are a concise, motivating LeetCode and interview prep coach." },
            { role: "user", content: prompt },
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 300,
        });

        aiAdvice = completion.choices[0].message.content || "";
      } catch (err: any) {
        console.error("OpenAI error:", err.message);
        aiAdvice = generateFallbackAdvice(username, easyCount, mediumCount, hardCount, weakTags, targetMedium, targetHard);
      }
    } else {
      aiAdvice = generateFallbackAdvice(username, easyCount, mediumCount, hardCount, weakTags, targetMedium, targetHard);
    }

    return NextResponse.json({
      acStats,
      totalStats,
      weakTags,
      recommendations,
      tagDistribution,
      aiAdvice,
      userLevel,
      contestRating: contestData?.rating ? Math.round(contestData.rating) : null,
      attendedContests: contestData?.attendedContestsCount || 0,
    });
  } catch (err) {
    console.error("LeetCode Coach error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateFallbackAdvice(
  username: string,
  easy: number,
  medium: number,
  hard: number,
  weakTags: string[],
  targetMedium: number,
  targetHard: number,
) {
  const topWeak = weakTags.slice(0, 3).map(t => t.replace(/-/g, " ")).join(", ");
  const mediumGap = Math.max(0, targetMedium - medium);
  const hardGap = Math.max(0, targetHard - hard);
  return `📊 Analysis for ${username}: You've solved ${easy} Easy / ${medium} Medium / ${hard} Hard problems.

🎯 Priority Topics: Your weakest areas are ${topWeak}. Dedicate the first 2 weeks specifically to these — solve 3–5 problems per topic before moving on.

📅 Daily Plan: Solve 2–3 Mediums daily. On weekends, tackle 1 Hard problem. To hit your goal, you need ${mediumGap} more Mediums and ${hardGap} more Hards.

🏆 Contest Tip: Participate in weekly LeetCode contests every Sunday. Even if you don't finish all 4 problems, the timed pressure builds instincts that solo practice can't replicate.`;
}
