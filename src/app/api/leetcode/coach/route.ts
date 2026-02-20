import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

interface SubmissionStat { difficulty: string; count: number; }
interface TagEntry      { tagName: string; tagSlug: string; problemsSolved: number; }
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
    user.submitStats.acSubmissionNum.forEach((s: SubmissionStat) => {
      acStats[s.difficulty] = s.count;
    });

    const totalStats: Record<string, number> = {};
    user.submitStats.totalSubmissionNum.forEach((s: SubmissionStat) => {
      totalStats[s.difficulty] = s.count;
    });

    // Aggregate all tag counts
    const allTags: { tagName: string; tagSlug: string; problemsSolved: number; tier: string }[] = [];
    const { advanced, intermediate, fundamental } = user.tagProblemCounts;

    fundamental.forEach((t: TagEntry) => allTags.push({ ...t, tier: "fundamental" }));
    intermediate.forEach((t: TagEntry) => allTags.push({ ...t, tier: "intermediate" }));
    advanced.forEach((t: TagEntry) => allTags.push({ ...t, tier: "advanced" }));

    // Identify weak tags — ones with fewest problems relative to tier importance
    const easyCount = acStats["Easy"] || 0;
    const mediumCount = acStats["Medium"] || 0;
    const hardCount = acStats["Hard"] || 0;
    const totalSolved = acStats["All"] || easyCount + mediumCount + hardCount;

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

    // Strong tags (most solved)
    const strongTags = allTags
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 3)
      .map(t => t.tagName);

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

    // Stats for coaching context
    const contestRating = contestData?.rating ? Math.round(contestData.rating) : null;
    const attendedContests = contestData?.attendedContestsCount || 0;
    const acceptanceRate = totalStats["All"] ? Math.round((totalSolved / totalStats["All"]) * 100) : 0;
    const targetMedium = goalMedium || mediumCount + 25;
    const targetHard = goalHard || hardCount + 10;

    // Generate AI advice
    let aiAdvice = "";

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are a world-class LeetCode performance coach, like a personal trainer for coding interviews. You MUST speak directly to the athlete (user), using "you" and "your" — never refer to them in the third person.

USER PROFILE:
- Username: ${username}
- Total Solved: ${totalSolved} problems (Easy: ${easyCount} | Medium: ${mediumCount} | Hard: ${hardCount})
- Acceptance Rate: ${acceptanceRate}%
- Contest Rating: ${contestRating ?? "No contests participated yet"}
- Contests Attended: ${attendedContests}
- Skill Level: ${userLevel}
- Strongest Topics: ${strongTags.join(", ")}
- Weakest Topics (lowest solved): ${weakTags.map(t => `${t.replace(/-/g, " ")} (${tagMap.get(t) || 0} solved)`).join(", ")}

GOAL: Medium → ${targetMedium} | Hard → ${targetHard}

Write a direct, personal, and motivating coaching advice report. Format it EXACTLY like this:

🎯 WHERE YOU STAND
[2–3 sentences giving an honest, direct assessment of their current level. Mention their strengths AND gaps. Be encouraging but realistic.]

⚠️ YOUR CRITICAL WEAK SPOTS
[Mention the top 2–3 weak tags by name and WHY each one matters for interviews/contests. Be specific — e.g., "You've only solved X dynamic programming problems, which is a red flag for FAANG interviews."]

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: [Specific focus area + daily target, e.g., "Grind 3 medium dynamic-programming problems daily."]
Week 3–4: [Next focus shift + how to level up]

🏆 CONTEST STRATEGY
[1–2 sentences on contest approach based on their current rating/participation. If they haven't attended contests, urge them to start.]

💡 COACH'S SECRET TIP
[One specific, tactical tip tailored to their exact weak spot that most people overlook — give real value here.]

Keep total length under 280 words. Be direct, bold, and motivating — like a coach who genuinely wants them to succeed.`;

        const completion = await client.chat.completions.create({
          messages: [
            { role: "system", content: "You are an elite, direct, and highly motivating LeetCode and coding interview coach. You give brutally honest but encouraging feedback like a professional athletic coach would. You always speak directly to the athlete using 'you/your'." },
            { role: "user", content: prompt },
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 500,
          temperature: 0.8,
        });

        aiAdvice = completion.choices[0].message.content || "";
      } catch (err: unknown) {
        console.error("OpenAI error:", err instanceof Error ? err.message : err);
        aiAdvice = generateFallbackAdvice(username, easyCount, mediumCount, hardCount, weakTags, strongTags, tagMap, contestRating, attendedContests, targetMedium, targetHard, userLevel);
      }
    } else {
      aiAdvice = generateFallbackAdvice(username, easyCount, mediumCount, hardCount, weakTags, strongTags, tagMap, contestRating, attendedContests, targetMedium, targetHard, userLevel);
    }

    return NextResponse.json({
      acStats,
      totalStats,
      weakTags,
      recommendations,
      tagDistribution,
      aiAdvice,
      userLevel,
      contestRating: contestRating,
      attendedContests: attendedContests,
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
  strongTags: string[],
  tagMap: Map<string, number>,
  contestRating: number | null,
  attendedContests: number,
  targetMedium: number,
  targetHard: number,
  userLevel: string,
) {
  const topWeak = weakTags.slice(0, 3).map(t => `${t.replace(/-/g, " ")} (${tagMap.get(t) || 0} solved)`);
  const mediumGap = Math.max(0, targetMedium - medium);
  const hardGap = Math.max(0, targetHard - hard);
  const levelLabel = userLevel === "beginner" ? "early-stage coder" : userLevel === "intermediate" ? "solid mid-level coder" : "advanced coder";
  const strongStr = strongTags.slice(0, 2).join(" and ");

  return `🎯 WHERE YOU STAND
${username}, you're a ${levelLabel} with ${easy + medium + hard} problems solved (Easy: ${easy} | Medium: ${medium} | Hard: ${hard}). Your strongest areas are ${strongStr}, which is a solid foundation — but there are clear gaps holding you back.

⚠️ YOUR CRITICAL WEAK SPOTS
Your weakest areas right now are ${topWeak.join(", ")}. These are not optional — they appear in nearly every technical interview at top companies. If you skip them, you're leaving money on the table.

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: Lock in on ${weakTags[0]?.replace(/-/g, " ") || "dynamic programming"} exclusively. Solve 3 Mediums every single day. No excuses.
Week 3–4: Shift to ${weakTags[1]?.replace(/-/g, " ") || "graphs"} + ${weakTags[2]?.replace(/-/g, " ") || "backtracking"}. You need ${mediumGap} more Mediums and ${hardGap} more Hards to hit your goal. That's ${Math.ceil(mediumGap / 14)} Mediums per day.

🏆 CONTEST STRATEGY
${attendedContests === 0 ? "You've never competed in a contest — that changes this Sunday. Sign up for LeetCode Weekly Contest and commit. Timed pressure is the only thing that truly sharpens your instincts." : `You've attended ${attendedContests} contests${contestRating ? ` with a rating of ${contestRating}` : ""}. Push yourself to participate every single week — consistency is your multiplier.`}

💡 COACH'S SECRET TIP
Don't just solve problems — study the patterns. After each problem, write down the core technique in one sentence. After 30 days you'll have a personal pattern library that no interview can catch you off guard with.`;
}
