import { NextResponse } from "next/server";

// Simple in-memory cache: username → { data, timestamp }
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes — LeetCode blocks heavy use

const PROFILE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        starRating
        userAvatar
        countryName
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
        totalSubmissionNum {
          difficulty
          count
        }
      }
      tagProblemCounts {
        advanced {
          tagName
          tagSlug
          problemsSolved
        }
        intermediate {
          tagName
          tagSlug
          problemsSolved
        }
        fundamental {
          tagName
          tagSlug
          problemsSolved
        }
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      topPercentage
    }
    recentAcSubmissionList(username: $username, limit: 15) {
      title
      titleSlug
      timestamp
      lang
    }
  }
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Serve from cache if fresh
  const cached = cache.get(username);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Mimic browser request to reduce bot detection
        "Referer": "https://leetcode.com",
        "Origin": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: PROFILE_QUERY,
        variables: { username },
      }),
      next: { revalidate: 0 }, // Don't Next.js cache this
    });

    if (!res.ok) {
      return NextResponse.json({ error: "LeetCode API error" }, { status: res.status });
    }

    const json = await res.json();

    if (json.errors) {
      return NextResponse.json({ error: json.errors[0]?.message || "GraphQL error" }, { status: 400 });
    }

    if (!json.data?.matchedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Store in cache
    cache.set(username, { data: json.data, ts: Date.now() });

    return NextResponse.json(json.data);
  } catch (err) {
    console.error("LeetCode API error:", err);
    return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 500 });
  }
}
