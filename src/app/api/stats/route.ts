import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// ── Rate limiting ──────────────────────────────────────────────────────────────
const ipLog = new Map<string, number[]>();
const RATE_WINDOW = 60_000;  // 1 min
const RATE_MAX    = 12;      // 12 requests / min / IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const reqs = (ipLog.get(ip) ?? []).filter(t => now - t < RATE_WINDOW);
  if (reqs.length >= RATE_MAX) return true;
  reqs.push(now);
  ipLog.set(ip, reqs);
  return false;
}

// ── Cache ──────────────────────────────────────────────────────────────────────
interface PlatformResult {
  handle:  string;
  solved:  number | null;
  error:   string | null;
}
interface StatsPayload {
  codeforces: PlatformResult;
  leetcode:   PlatformResult;
  atcoder:    PlatformResult;
  codechef:   PlatformResult;
  total:      number;
  fetchedAt:  number;
}

const cache    = new Map<string, { data: StatsPayload; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// ── Platform fetchers ──────────────────────────────────────────────────────────
async function fetchCF(handle: string): Promise<Omit<PlatformResult, 'handle'>> {
  try {
    const res  = await fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=100000`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();
    if (data.status !== 'OK') return { solved: null, error: 'Handle not found' };

    const seen = new Set<string>();
    for (const sub of data.result as any[]) {
      if (sub.verdict !== 'OK' || !sub.problem) continue;
      seen.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
    return { solved: seen.size, error: null };
  } catch {
    return { solved: null, error: 'Fetch failed' };
  }
}

async function fetchLC(handle: string): Promise<Omit<PlatformResult, 'handle'>> {
  try {
    const res  = await fetch('https://leetcode.com/graphql', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query userProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum { difficulty count }
            }
          }
        }`,
        variables: { username: handle },
      }),
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    const user = json.data?.matchedUser;
    if (!user) return { solved: null, error: 'Handle not found' };
    const total =
      (user.submitStats.acSubmissionNum as any[]).find(x => x.difficulty === 'All')?.count ?? 0;
    return { solved: total, error: null };
  } catch {
    return { solved: null, error: 'Fetch failed' };
  }
}

async function fetchAtCoder(handle: string): Promise<Omit<PlatformResult, 'handle'>> {
  try {
    const res  = await fetch(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${encodeURIComponent(handle)}`,
      { next: { revalidate: 3600 }, headers: { 'User-Agent': 'CPTracker/1.0' } },
    );
    if (!res.ok) {
      // 404 = user not found; other = API error
      return { solved: null, error: res.status === 404 ? 'Handle not found' : 'Fetch failed' };
    }
    const data = await res.json();
    if (data.count == null) return { solved: null, error: 'No data returned' };
    return { solved: data.count as number, error: null };
  } catch {
    return { solved: null, error: 'Fetch failed' };
  }
}

async function fetchCodeChef(handle: string): Promise<Omit<PlatformResult, 'handle'>> {
  try {
    const res  = await fetch(
      `https://www.codechef.com/api/users/${encodeURIComponent(handle)}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CPTracker/1.0)' },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return { solved: null, error: 'Handle not found' };
    const data = await res.json();
    if (data.status !== 'OK') return { solved: null, error: 'Handle not found' };

    // CodeChef API v2 fields (may vary)
    const solved: number | null =
      data.fully_solved?.count ??
      data.content?.programSolvedCount ??
      null;
    return {
      solved,
      error: solved === null ? 'Solved count unavailable' : null,
    };
  } catch {
    return { solved: null, error: 'Fetch failed' };
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded — try again in a minute.' },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf')?.trim() || null;
  const lc = searchParams.get('lc')?.trim() || null;
  const at = searchParams.get('at')?.trim() || null;
  const cc = searchParams.get('cc')?.trim() || null;

  if (!cf && !lc && !at && !cc) {
    return NextResponse.json({ error: 'Provide at least one handle.' }, { status: 400 });
  }

  const cacheKey = `${cf}|${lc}|${at}|${cc}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return NextResponse.json(hit.data);
  }

  const none: Omit<PlatformResult, 'handle'> = { solved: null, error: null };

  const [cfR, lcR, atR, ccR] = await Promise.all([
    cf ? fetchCF(cf)       : Promise.resolve(none),
    lc ? fetchLC(lc)       : Promise.resolve(none),
    at ? fetchAtCoder(at)  : Promise.resolve(none),
    cc ? fetchCodeChef(cc) : Promise.resolve(none),
  ]);

  const total = [cfR, lcR, atR, ccR].reduce((s, r) => s + (r.solved ?? 0), 0);

  const payload: StatsPayload = {
    codeforces: { handle: cf ?? '', ...cfR },
    leetcode:   { handle: lc ?? '', ...lcR },
    atcoder:    { handle: at ?? '', ...atR },
    codechef:   { handle: cc ?? '', ...ccR },
    total,
    fetchedAt: Date.now(),
  };

  cache.set(cacheKey, { data: payload, ts: Date.now() });
  return NextResponse.json(payload);
}
