import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SubmissionStat { difficulty: string; count: number; }
interface TagEntry      { tagName: string; tagSlug: string; problemsSolved: number; }

const IMPORTANT_TAGS_BY_TIER = {
  fundamental:  ["array", "string", "hash-table", "math", "sorting", "greedy", "binary-search", "two-pointers"],
  intermediate: ["dynamic-programming", "depth-first-search", "breadth-first-search", "backtracking", "stack", "queue", "linked-list", "tree", "graph", "sliding-window", "prefix-sum"],
  advanced:     ["segment-tree", "trie", "union-find", "topological-sort", "bit-manipulation", "monotonic-stack", "divide-and-conquer"],
};

export async function POST(req: Request) {
  try {
    const { username, goalMedium, goalHard } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Derive the base URL from the incoming request (works in dev, staging, prod)
    const { origin } = new URL(req.url);
    const lcRes  = await fetch(`${origin}/api/leetcode?username=${username}`);
    const data   = await lcRes.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }

    const user        = data.matchedUser;
    const contestData = data.userContestRanking;

    // Parse solved counts
    const acStats: Record<string, number>    = {};
    const totalStats: Record<string, number> = {};
    user.submitStats.acSubmissionNum.forEach((s: SubmissionStat) => { acStats[s.difficulty]    = s.count; });
    user.submitStats.totalSubmissionNum.forEach((s: SubmissionStat) => { totalStats[s.difficulty] = s.count; });

    // Aggregate all tag counts — guard against null tagProblemCounts
    const allTags: { tagName: string; tagSlug: string; problemsSolved: number; tier: string }[] = [];
    const tagProblemCounts = user.tagProblemCounts ?? { fundamental: [], intermediate: [], advanced: [] };
    const { advanced = [], intermediate = [], fundamental = [] } = tagProblemCounts;

    fundamental.forEach((t: TagEntry) => allTags.push({ ...t, tier: "fundamental" }));
    intermediate.forEach((t: TagEntry) => allTags.push({ ...t, tier: "intermediate" }));
    advanced.forEach((t: TagEntry) => allTags.push({ ...t, tier: "advanced" }));

    // Solved counts
    const easyCount   = acStats["Easy"]   || 0;
    const mediumCount = acStats["Medium"] || 0;
    const hardCount   = acStats["Hard"]   || 0;
    const totalSolved = acStats["All"]    || easyCount + mediumCount + hardCount;

    // Determine user level
    let userLevel: "beginner" | "intermediate" | "advanced" = "beginner";
    if (mediumCount > 50  || hardCount > 10) userLevel = "intermediate";
    if (mediumCount > 150 || hardCount > 50) userLevel = "advanced";

    // Relevant tags based on level
    const relevantImportantTags = userLevel === "beginner"
      ? IMPORTANT_TAGS_BY_TIER.fundamental
      : userLevel === "intermediate"
        ? [...IMPORTANT_TAGS_BY_TIER.fundamental, ...IMPORTANT_TAGS_BY_TIER.intermediate]
        : [...IMPORTANT_TAGS_BY_TIER.intermediate, ...IMPORTANT_TAGS_BY_TIER.advanced];

    const tagMap   = new Map(allTags.map(t => [t.tagSlug, t.problemsSolved]));
    const weakTags = relevantImportantTags
      .map(slug => ({ slug, solved: tagMap.get(slug) || 0 }))
      .sort((a, b) => a.solved - b.solved)
      .slice(0, 6)
      .map(t => t.slug);

    const strongTags = allTags
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 3)
      .map(t => t.tagName);

    // Build recommendations (topic-based — LeetCode doesn't expose full unsolved set)
    const recommendations = weakTags.slice(0, 5).map(slug => {
      const difficulty = IMPORTANT_TAGS_BY_TIER.fundamental.includes(slug) ? "Easy/Medium"
        : IMPORTANT_TAGS_BY_TIER.intermediate.includes(slug)               ? "Medium"
        : "Medium/Hard";
      return {
        topic:          slug.replace(/-/g, " "),
        difficulty,
        url:            `https://leetcode.com/tag/${slug}/`,
        solvedCount:    tagMap.get(slug) || 0,
        suggestedCount: difficulty === "Easy/Medium" ? 20 : difficulty === "Medium" ? 15 : 10,
      };
    });

    // Full tag distribution for chart
    const tagDistribution = allTags
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 15);

    // Contest + acceptance stats
    const contestRating    = contestData?.rating                 ? Math.round(contestData.rating) : null;
    const attendedContests = contestData?.attendedContestsCount || 0;
    const acceptanceRate   = totalStats["All"]                   ? Math.round((totalSolved / totalStats["All"]) * 100) : 0;
    const targetMedium     = goalMedium || mediumCount + 25;
    const targetHard       = goalHard   || hardCount   + 10;

    // Build full tag table for AI analysis
    const fullTagTable = allTags
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .map(t => `${t.tagName}: ${t.problemsSolved} solved (${t.tier})`)
      .join("\n");

    // Generate AI advice — always use the key, fall back to static if API fails
    let aiAdvice = "";
    try {
      const prompt = `You are a world-class LeetCode performance coach. You MUST speak directly to the user using "you" and "your" — never third person.

USER PROFILE:
- Username: ${username}
- Total Solved: ${totalSolved} (Easy: ${easyCount} | Medium: ${mediumCount} | Hard: ${hardCount})
- Acceptance Rate: ${acceptanceRate}%
- Contest Rating: ${contestRating ?? "No contests participated yet"}
- Contests Attended: ${attendedContests}
- Skill Level: ${userLevel}

FULL TOPIC BREAKDOWN (sorted by solved count):
${fullTagTable}

GOALS: Reach Medium → ${targetMedium} | Hard → ${targetHard}

Based on the raw data above, YOU decide which topics are the most critical weak spots given the user's current level (${userLevel}) and goals. A topic is weak if the user has solved too few problems relative to what someone aiming for ${targetMedium} Mediums / ${targetHard} Hards typically needs.

Write a direct, personal coaching report formatted EXACTLY like this:

🎯 WHERE YOU STAND
[2–3 sentences: honest assessment of current level, note strengths from the data, and what gap exists to reach the goal.]

⚠️ YOUR CRITICAL WEAK SPOTS
[From your analysis of the full topic table, name the 2–3 most critical topics to fix. Explain WHY each one matters for interviews — mention their actual solved count from the data.]

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: [Most critical weak topic — specific daily target + problem count]
Week 3–4: [Next topic shift + how to push into harder difficulty]

🏆 CONTEST STRATEGY
[1–2 sentences on contest approach based on their rating/participation. If 0 contests, strongly urge them to start.]

💡 COACH'S SECRET TIP
[One concrete, tactical tip for their biggest gap that most people overlook — real value, not generic advice.]

Keep under 280 words. Be direct and motivating like a real coach.`;

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an elite, direct, and motivating LeetCode and coding interview coach. Speak directly to the athlete using 'you/your'. Give brutally honest but encouraging feedback.",
          },
          { role: "user", content: prompt },
        ],
        model:       "gpt-3.5-turbo",
        max_tokens:  500,
        temperature: 0.8,
      });

      aiAdvice = completion.choices[0].message.content || "";
    } catch (err: unknown) {
      console.error("OpenAI error:", err instanceof Error ? err.message : err);
      aiAdvice = generateFallbackAdvice(
        username, easyCount, mediumCount, hardCount,
        weakTags, strongTags, tagMap,
        contestRating, attendedContests,
        targetMedium, targetHard, userLevel
      );
    }

    return NextResponse.json({
      acStats,
      totalStats,
      weakTags,
      recommendations,
      tagDistribution,
      aiAdvice,
      userLevel,
      contestRating,
      attendedContests,
    });
  } catch (err) {
    console.error("LeetCode Coach error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateFallbackAdvice(
  username:        string,
  easy:            number,
  medium:          number,
  hard:            number,
  weakTags:        string[],
  strongTags:      string[],
  tagMap:          Map<string, number>,
  contestRating:   number | null,
  attendedContests: number,
  targetMedium:    number,
  targetHard:      number,
  userLevel:       string,
) {
  const topWeak    = weakTags.slice(0, 3).map(t => `${t.replace(/-/g, " ")} (${tagMap.get(t) || 0} solved)`);
  const mediumGap  = Math.max(0, targetMedium - medium);
  const hardGap    = Math.max(0, targetHard   - hard);
  const levelLabel = userLevel === "beginner" ? "early-stage coder"
                   : userLevel === "intermediate" ? "solid mid-level coder"
                   : "advanced coder";
  const strongStr  = strongTags.slice(0, 2).join(" and ");

  return `🎯 WHERE YOU STAND
${username}, you're a ${levelLabel} with ${easy + medium + hard} problems solved (Easy: ${easy} | Medium: ${medium} | Hard: ${hard}). Your strongest areas are ${strongStr}, which is a solid foundation — but there are clear gaps that will cost you in interviews.

⚠️ YOUR CRITICAL WEAK SPOTS
Your most underdeveloped areas are ${topWeak.join(", ")}. These aren't optional — they appear in nearly every technical interview at top companies. Skipping them is leaving opportunities on the table.

📅 YOUR 30-DAY BATTLE PLAN
Week 1–2: Lock in on ${weakTags[0]?.replace(/-/g, " ") || "dynamic programming"} exclusively. Solve 3 Mediums every single day. No excuses.
Week 3–4: Shift to ${weakTags[1]?.replace(/-/g, " ") || "graphs"} + ${weakTags[2]?.replace(/-/g, " ") || "backtracking"}. You need ${mediumGap} more Mediums and ${hardGap} more Hards to hit your goal — that's ${Math.ceil(mediumGap / 14)} Mediums per day.

🏆 CONTEST STRATEGY
${attendedContests === 0
  ? "You've never competed in a contest — that changes this weekend. Sign up for LeetCode Weekly Contest now. Timed pressure is the only thing that truly sharpens your instincts."
  : `You've attended ${attendedContests} contests${contestRating ? ` with a rating of ${contestRating}` : ""}. Push yourself to compete every single week — consistency is your multiplier.`}

💡 COACH'S SECRET TIP
Don't just solve problems — study the patterns. After each problem, write down the core technique in one sentence. After 30 days you'll have a personal pattern library that no interview can catch you off guard with.`;
}
