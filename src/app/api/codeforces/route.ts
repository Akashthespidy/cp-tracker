
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 requests per minute per IP — avoids hammering Codeforces upstream
const limiter = createRateLimiter(60_000, 10);

// In-memory response cache: handle → { data, timestamp }
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export async function GET(request: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (limiter.isLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded — please wait a minute before retrying." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json(
      { error: "Handle is required" },
      { status: 400 }
    );
  }

  // Serve from cache if fresh
  const cached = cache.get(handle);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // 1. Fetch User Info
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const infoData = await infoRes.json();

    if (infoData.status !== "OK") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Rating History
    const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const ratingData = await ratingRes.json();

    // 3. Fetch Submissions — up to 10000 for accurate total-solved counts
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
    const statusData = await statusRes.json();

    const payload = {
        info: infoData.result[0],
        ratingHistory: ratingData.status === 'OK' ? ratingData.result : [],
        submissions: statusData.status === 'OK' ? statusData.result : []
    };

    cache.set(handle, { data: payload, ts: Date.now() });

    return NextResponse.json(payload);

  } catch (error) {
    console.error("Codeforces API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
