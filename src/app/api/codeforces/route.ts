
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json(
      { error: "Handle is required" },
      { status: 400 }
    );
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

    // 3. Fetch Submissions (for problem stats)
    // Limit to last 1000 to avoid hitting limits/timeouts, or fetch all if needed for accurate stats?
    // Codeforces user.status can be heavy. Let's try fetching with count first or just handle it.
    // Fetching 500 should be enough for "recent" stats, but for "total solved" we need more.
    // For now, let's fetch up to 1000.
    // Fetching up to 10000 to ensure we capture all solved problems for most users.
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
    const statusData = await statusRes.json();

    return NextResponse.json({
        info: infoData.result[0],
        ratingHistory: ratingData.status === 'OK' ? ratingData.result : [],
        submissions: statusData.status === 'OK' ? statusData.result : []
    });

  } catch (error) {
    console.error("Codeforces API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
