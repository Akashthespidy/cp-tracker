import { NextResponse } from 'next/server';

// ── In-memory cache (per handle) ──────────────────────────────────────────────
// Bump CACHE_VERSION whenever the ProcessedHandle shape changes to auto-bust
// any live in-memory entries that don't match the current schema.
const CACHE_VERSION = 2;
const cache = new Map<string, { data: ProcessedHandle; ts: number; v: number }>();
const CACHE_TTL = 1000 * 60 * 20; // 20 min

// ── Rating buckets ─────────────────────────────────────────────────────────────
type RatingBucket = '≤800' | '801–1000' | '1001–1200' | '1201–1400' | '1401–1600' | '1601–1900' | '1901+';

function getBucket(r: number): RatingBucket {
  if (r <= 800)  return '≤800';
  if (r <= 1000) return '801–1000';
  if (r <= 1200) return '1001–1200';
  if (r <= 1400) return '1201–1400';
  if (r <= 1600) return '1401–1600';
  if (r <= 1900) return '1601–1900';
  return '1901+';
}

export interface SolvedProblem {
  name: string;
  contestId: number;
  index: string;
  rating: number | null;
  url: string;
}

interface ProcessedHandle {
  info: {
    handle:    string;
    rating:    number;
    maxRating: number;
    rank:      string;
    avatar:    string;
  };
  ratingBuckets: Record<RatingBucket, number>;
  tagCounts:     Record<string, number>;
  /** tag → solved problems, sorted by rating asc */
  tagProblems:   Record<string, SolvedProblem[]>;
  totalSolved:   number;
  contestCount:  number;
}

async function fetchAndProcess(handle: string): Promise<ProcessedHandle> {
  const cached = cache.get(handle);
  // Valid only when: not expired AND matches the current schema version
  if (
    cached &&
    cached.v === CACHE_VERSION &&
    Date.now() - cached.ts < CACHE_TTL &&
    cached.data.tagProblems // extra guard: ensure this field exists
  ) {
    return cached.data;
  }

  const [infoRes, ratingRes, statusRes] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
    fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
    fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`),
  ]);

  const [infoData, ratingData, statusData] = await Promise.all([
    infoRes.json(),
    ratingRes.json(),
    statusRes.json(),
  ]);

  if (infoData.status !== 'OK') throw new Error(`Handle not found: ${handle}`);

  const info = infoData.result[0];
  const buckets: Record<RatingBucket, number> = {
    '≤800': 0, '801–1000': 0, '1001–1200': 0, '1201–1400': 0,
    '1401–1600': 0, '1601–1900': 0, '1901+': 0,
  };
  const tagMap:      Record<string, number>         = {};
  const tagProblems: Record<string, SolvedProblem[]> = {};
  const solved = new Set<string>();

  if (statusData.status === 'OK') {
    for (const sub of statusData.result) {
      if (sub.verdict !== 'OK' || !sub.problem) continue;
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      if (solved.has(key)) continue;
      solved.add(key);

      if (sub.problem.rating) buckets[getBucket(sub.problem.rating)]++;

      const prob: SolvedProblem = {
        name:      sub.problem.name,
        contestId: sub.problem.contestId,
        index:     sub.problem.index,
        rating:    sub.problem.rating ?? null,
        url: `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
      };

      for (const tag of sub.problem.tags ?? []) {
        tagMap[tag] = (tagMap[tag] ?? 0) + 1;
        if (!tagProblems[tag]) tagProblems[tag] = [];
        tagProblems[tag].push(prob);
      }
    }

    // Sort each tag's problem list by rating asc (unrated problems go last)
    for (const tag of Object.keys(tagProblems)) {
      tagProblems[tag].sort((a, b) => {
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return a.rating - b.rating;
      });
    }
  }

  const result: ProcessedHandle = {
    info: {
      handle:    info.handle,
      rating:    info.rating    ?? 0,
      maxRating: info.maxRating ?? 0,
      rank: info.rank
        ? info.rank.charAt(0).toUpperCase() + info.rank.slice(1)
        : 'Unrated',
      avatar: info.titlePhoto ?? '',
    },
    ratingBuckets: buckets,
    tagCounts:     tagMap,
    tagProblems,
    totalSolved:   solved.size,
    contestCount:  ratingData.status === 'OK' ? ratingData.result.length : 0,
  };

  cache.set(handle, { data: result, ts: Date.now(), v: CACHE_VERSION });
  return result;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const h1 = searchParams.get('h1')?.trim();
  const h2 = searchParams.get('h2')?.trim();

  if (!h1 || !h2) {
    return NextResponse.json({ error: 'Both handles required' }, { status: 400 });
  }

  try {
    const [a, b] = await Promise.all([fetchAndProcess(h1), fetchAndProcess(h2)]);
    return NextResponse.json({ a, b });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? (err.message ?? 'Failed to fetch') : 'Failed to fetch' }, { status: 404 });
  }
}
