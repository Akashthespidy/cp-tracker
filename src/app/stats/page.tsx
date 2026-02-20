'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import {
  BarChart2, Share2, Copy, Check, RefreshCw, Zap,
  ExternalLink, Globe, AlertCircle, Clock,
} from 'lucide-react';

// ── Platform config ─────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    key:         'cf' as const,
    name:        'Codeforces',
    abbr:        'CF',
    color:       '#3b82f6',
    bg:          'from-blue-600/20 to-blue-800/10',
    border:      'border-blue-500/25',
    placeholder: 'e.g. tourist',
    url:         (h: string) => `https://codeforces.com/profile/${h}`,
  },
  {
    key:         'lc' as const,
    name:        'LeetCode',
    abbr:        'LC',
    color:       '#ffa116',
    bg:          'from-amber-600/20 to-amber-800/10',
    border:      'border-amber-500/25',
    placeholder: 'e.g. SomeCoder',
    url:         (h: string) => `https://leetcode.com/${h}`,
  },
  {
    key:         'at' as const,
    name:        'AtCoder',
    abbr:        'AC',
    color:       '#10b981',
    bg:          'from-emerald-600/20 to-emerald-800/10',
    border:      'border-emerald-500/25',
    placeholder: 'e.g. chokudai',
    url:         (h: string) => `https://atcoder.jp/users/${h}`,
  },
  {
    key:         'cc' as const,
    name:        'CodeChef',
    abbr:        'CC',
    color:       '#a78bfa',
    bg:          'from-violet-600/20 to-violet-800/10',
    border:      'border-violet-500/25',
    placeholder: 'e.g. admin',
    url:         (h: string) => `https://www.codechef.com/users/${h}`,
  },
] as const;

type PlatformKey = typeof PLATFORMS[number]['key'];

interface PlatformData {
  handle: string;
  solved: number | null;
  error:  string | null;
}

interface StatsResult {
  codeforces: PlatformData;
  leetcode:   PlatformData;
  atcoder:    PlatformData;
  codechef:   PlatformData;
  total:      number;
  fetchedAt:  number;
}

// ── Animated number counter ─────────────────────────────────────────────────────
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setVal(0); return;
    }
    const start = performance.now();
    const step  = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
       
      setVal(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return <>{val.toLocaleString()}</>;
}

// ── Platform stat card ──────────────────────────────────────────────────────────
function PlatformCard({
  platform,
  result,
  delay,
}: {
  platform: typeof PLATFORMS[number];
  result:   PlatformData | null;
  delay:    number;
}) {
  const hasHandle = !!result?.handle;
  const hasSolved = result?.solved != null;
  const hasError  = !!result?.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        className={`border relative overflow-hidden h-full ${platform.border}`}
        style={{ background: `linear-gradient(135deg, ${platform.color}12, transparent 60%)` }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: platform.color }} />

        <CardContent className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {/* Abbr badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 border"
                style={{
                  background: `${platform.color}18`,
                  borderColor: `${platform.color}35`,
                  color: platform.color,
                }}
              >
                {platform.abbr}
              </div>
              <div>
                <div className="font-semibold text-sm">{platform.name}</div>
                {hasHandle ? (
                  <a
                    href={result?.handle ? platform.url(result.handle) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5 group transition-colors"
                  >
                    <span className="truncate max-w-[120px]">{result?.handle}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground/50 italic">Not provided</span>
                )}
              </div>
            </div>

            {/* Status badge */}
            {hasHandle && (
              <Badge
                variant="outline"
                className="text-[10px] shrink-0 border-0 font-medium"
                style={{
                  background: hasError
                    ? '#ef444420'
                    : hasSolved
                      ? `${platform.color}18`
                      : '#88888820',
                  color: hasError ? '#ef4444' : hasSolved ? platform.color : '#888',
                }}
              >
                {hasError ? 'Error' : hasSolved ? 'Fetched' : '—'}
              </Badge>
            )}
          </div>

          {/* Solved count */}
          <div>
            {!hasHandle ? (
              <div className="text-3xl font-extrabold tabular-nums text-muted-foreground/30">—</div>
            ) : hasError ? (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs">{result?.error}</span>
              </div>
            ) : (
              <div className="text-3xl font-extrabold tabular-nums" style={{ color: platform.color }}>
                {hasSolved ? <CountUp target={result!.solved!} /> : '—'}
              </div>
            )}
            {hasSolved && !hasError && (
              <div className="text-xs text-muted-foreground mt-0.5">problems solved</div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main content (needs Suspense because of useSearchParams) ────────────────────
function StatsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [handles, setHandles] = useState<Record<PlatformKey, string>>({
    cf: searchParams.get('cf') ?? '',
    lc: searchParams.get('lc') ?? '',
    at: searchParams.get('at') ?? '',
    cc: searchParams.get('cc') ?? '',
  });
  const [result,   setResult]   = useState<StatsResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  // ── Build shareable URL ─────────────────────────────────────────────────────
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (handles.cf) params.set('cf', handles.cf);
    if (handles.lc) params.set('lc', handles.lc);
    if (handles.at) params.set('at', handles.at);
    if (handles.cc) params.set('cc', handles.cc);
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/stats${params.toString() ? '?' + params.toString() : ''}`;
  }, [handles]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (h: typeof handles) => {
    const any = Object.values(h).some(v => v.trim());
    if (!any) return;

    setLoading(true);
    setError(null);

    // Update URL so it's shareable right away
    const params = new URLSearchParams();
    if (h.cf) params.set('cf', h.cf);
    if (h.lc) params.set('lc', h.lc);
    if (h.at) params.set('at', h.at);
    if (h.cc) params.set('cc', h.cc);
    router.replace(`/stats?${params.toString()}`, { scroll: false });

    try {
      const qs  = params.toString();
      const res = await fetch(`/api/stats?${qs}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? (e.message ?? 'Failed to fetch stats') : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auto-fetch on load if URL already has params
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const any = (['cf', 'lc', 'at', 'cc'] as PlatformKey[]).some(k => searchParams.get(k));
    if (any) fetchStats(handles);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // ── Copy shareable link ─────────────────────────────────────────────────────
  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyHandle = Object.values(handles).some(h => h.trim());

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 space-y-10 max-w-4xl">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-amber-500/20 border border-white/10">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Multi-Platform Stats</h1>
            <p className="text-sm text-muted-foreground">
              Live solved counts across Codeforces, LeetCode, AtCoder and CodeChef — shareable via link
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Input form ───────────────────────────────────────────────────────── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLATFORMS.map(p => (
              <div key={p.key} className="relative">
                {/* Colour dot indicator */}
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: p.color }}
                />
                <Input
                  id={`handle-${p.key}`}
                  className="pl-7 h-10 bg-background/50 border-border/60 text-sm font-medium pr-24"
                  placeholder={`${p.name} — ${p.placeholder}`}
                  value={handles[p.key]}
                  onChange={e => setHandles(prev => ({ ...prev, [p.key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && fetchStats(handles)}
                />
                {/* Inline abbr label */}
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${p.color}18`, color: p.color }}
                >
                  {p.abbr}
                </span>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              onClick={() => fetchStats(handles)}
              disabled={loading || !hasAnyHandle}
              className="h-10 px-6 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white border-0"
            >
              {loading
                ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Fetching…</>
                : <><Zap className="h-4 w-4 mr-2" /> Get Stats</>
              }
            </Button>

            {result && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="h-10 px-4 gap-2 text-sm"
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy shareable link</>
                }
              </Button>
            )}

            {result && (
              <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                Cached 1 h · fetched at{' '}
                {new Date(result.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center pt-1">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Total card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <Card className="border border-white/10 overflow-hidden relative" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08), rgba(16,185,129,0.06))',
              }}>
                {/* Animated gradient top bar */}
                <div className="absolute top-0 inset-x-0 h-[3px]"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #ffa116)' }}
                />
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">
                      Total Problems Solved
                    </p>
                    <div className="text-6xl font-extrabold tabular-nums text-transparent bg-clip-text"
                      style={{ backgroundImage: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#10b981)' }}
                    >
                      <CountUp target={result.total} duration={1500} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      across {[result.codeforces, result.leetcode, result.atcoder, result.codechef]
                        .filter(p => p.solved != null).length} platform{[result.codeforces, result.leetcode, result.atcoder, result.codechef]
                        .filter(p => p.solved != null).length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Breakdown pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {PLATFORMS.map(p => {
                      const r = result[p.key === 'cf' ? 'codeforces' : p.key === 'lc' ? 'leetcode' : p.key === 'at' ? 'atcoder' : 'codechef'];
                      if (!r.handle) return null;
                      return (
                        <div
                          key={p.key}
                          className="flex flex-col items-center px-3 py-2 rounded-xl border min-w-[70px]"
                          style={{ borderColor: `${p.color}30`, background: `${p.color}0c` }}
                        >
                          <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.abbr}</span>
                          <span className="text-lg font-extrabold tabular-nums" style={{ color: p.color }}>
                            {r.solved != null ? r.solved.toLocaleString() : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Per-platform cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLATFORMS.map((p, i) => {
                const key = p.key === 'cf' ? 'codeforces' : p.key === 'lc' ? 'leetcode' : p.key === 'at' ? 'atcoder' : 'codechef';
                return (
                  <PlatformCard
                    key={p.key}
                    platform={p}
                    result={result[key]}
                    delay={0.1 + i * 0.07}
                  />
                );
              })}
            </div>

            {/* Share CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className="border border-white/8 bg-gradient-to-r from-indigo-500/5 to-violet-500/5">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                  <Share2 className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Share your stats</p>
                    <p className="text-xs text-muted-foreground truncate">{buildShareUrl()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="shrink-0 gap-1.5 text-xs h-8"
                  >
                    {copied ? <><Check className="h-3 w-3 text-emerald-400" />Copied!</> : <><Copy className="h-3 w-3" />Copy link</>}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(16,185,129,0.08))' }}
          >
            <BarChart2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground">No stats yet</p>
            <p className="text-sm text-muted-foreground/60">
              Enter at least one handle above and hit <b>Get Stats</b>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {[
              { label: 'Live fetch   — no login', icon: '⚡' },
              { label: 'Cached 1-hour', icon: '⏱' },
              { label: 'Shareable URL', icon: '🔗' },
              { label: '4 platforms', icon: '🌏' },
            ].map(f => (
              <span key={f.label} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border/50 text-muted-foreground">
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Page shell (Suspense required for useSearchParams) ─────────────────────────
export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading…
          </div>
        }
      >
        <StatsContent />
      </Suspense>
    </div>
  );
}
