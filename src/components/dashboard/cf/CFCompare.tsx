'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Swords, CheckCircle2, Search, ExternalLink,
  RefreshCw, Trophy, Zap, BarChart2, Tag, ArrowUp, ArrowDown, Minus,
} from 'lucide-react';

// ── Colours ────────────────────────────────────────────────────────────────────
const COLOR_A = '#6366f1'; // indigo
const COLOR_B = '#f59e0b'; // amber

const RANK_COLORS: Record<string, string> = {
  'legendary grandmaster':    '#ff0000',
  'international grandmaster':'#ff0000',
  'grandmaster':              '#ff0000',
  'international master':     '#ff8c00',
  'master':                   '#ff8c00',
  'candidate master':         '#aa00aa',
  'expert':                   '#0000ff',
  'specialist':               '#03a89e',
  'pupil':                    '#008000',
  'newbie':                   '#808080',
};

function rankColor(rank: string) {
  const lower = rank.toLowerCase();
  for (const [key, val] of Object.entries(RANK_COLORS)) {
    if (lower.includes(key)) return val;
  }
  return '#808080';
}

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(10,12,20,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};
const TOOLTIP_ITEM  = { color: '#fff' };
const TOOLTIP_LABEL = { color: '#aaa' };

// ── Types ──────────────────────────────────────────────────────────────────────
interface SolvedProblem {
  name:      string;
  contestId: number;
  index:     string;
  rating:    number | null;
  url:       string;
}

interface HandleData {
  info: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    avatar: string;
  };
  ratingBuckets: Record<string, number>;
  tagCounts:     Record<string, number>;
  tagProblems:   Record<string, SolvedProblem[]>;
  totalSolved:   number;
  contestCount:  number;
}

interface CompareResult {
  a: HandleData;
  b: HandleData;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function StatNum({ value, color }: { value: number; color: string }) {
  return (
    <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>
      {value.toLocaleString()}
    </span>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────
function Delta({ a, b, label }: { a: number; b: number; label: string }) {
  const diff = a - b;
  if (diff === 0) return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> Tied in {label}
    </span>
  );
  const winner = diff > 0 ? 'A' : 'B';
  const color  = diff > 0 ? COLOR_A : COLOR_B;
  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
      {diff > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(diff).toLocaleString()} ahead in {label}
    </span>
  );
}

// ── Mini profile card ─────────────────────────────────────────────────────────
function MiniProfile({ data, accent }: { data: HandleData; accent: string }) {
  const rc = rankColor(data.info.rank);
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
    >
      <Avatar className="h-12 w-12 shrink-0 border-2" style={{ borderColor: `${accent}50` }}>
        <AvatarImage src={data.info.avatar} />
        <AvatarFallback className="font-bold text-lg" style={{ color: accent }}>
          {data.info.handle[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-base truncate" style={{ color: accent }}>
          {data.info.handle}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <Badge
            className="text-[10px] px-1.5 py-0 border-0"
            style={{ backgroundColor: `${rc}20`, color: rc }}
          >
            {data.info.rank}
          </Badge>
          <span className="text-xs text-muted-foreground">{data.info.rating} rating</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xl font-extrabold" style={{ color: accent }}>{data.info.rating}</div>
        <div className="text-[10px] text-muted-foreground">rating</div>
      </div>
    </div>
  );
}

// ── Custom Tooltip for grouped bar ───────────────────────────────────────────
function BucketTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2 rounded-lg text-xs space-y-1 min-w-[140px]">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.fill }} className="font-medium">{p.name}</span>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tag comparison tooltip ────────────────────────────────────────────────────
function TagTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const [a, b] = [payload.find((p: any) => p.dataKey === 'a'), payload.find((p: any) => p.dataKey === 'b')];
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2 rounded-lg text-xs space-y-1 min-w-[160px]">
      <p className="text-[11px] font-semibold text-muted-foreground capitalize mb-1.5">{label}</p>
      {a && <div className="flex justify-between gap-4"><span style={{ color: COLOR_A }} className="font-medium">{a.name}</span><span className="text-white font-bold">{a.value}</span></div>}
      {b && <div className="flex justify-between gap-4"><span style={{ color: COLOR_B }} className="font-medium">{b.name}</span><span className="text-white font-bold">{b.value}</span></div>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CFCompare() {
  const [handleA, setHandleA] = useState('');
  const [handleB, setHandleB] = useState('');
  const [data,    setData]    = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');

  const compare = async () => {
    if (!handleA.trim() || !handleB.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveTag(null);
    try {
      const res  = await fetch(`/api/codeforces/compare?h1=${encodeURIComponent(handleA.trim())}&h2=${encodeURIComponent(handleB.trim())}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Rating bucket chart data ───────────────────────────────────────────────
  const bucketData = useMemo(() => {
    if (!data) return [];
    const buckets = ['≤800','801–1000','1001–1200','1201–1400','1401–1600','1601–1900','1901+'];
    return buckets.map(b => ({
      bucket: b,
      [data.a.info.handle]: data.a.ratingBuckets[b] ?? 0,
      [data.b.info.handle]: data.b.ratingBuckets[b] ?? 0,
    }));
  }, [data]);

  // ── Union of all tags, sorted by combined count ────────────────────────────
  const allTags = useMemo(() => {
    if (!data) return [];
    const union = new Map<string, number>();
    for (const [t, c] of Object.entries(data.a.tagCounts)) union.set(t, (union.get(t) ?? 0) + c);
    for (const [t, c] of Object.entries(data.b.tagCounts)) union.set(t, (union.get(t) ?? 0) + c);
    return [...union.entries()]
      .sort((x, y) => y[1] - x[1])
      .map(([tag]) => tag);
  }, [data]);

  const filteredTags = useMemo(
    () => allTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase())),
    [allTags, tagSearch],
  );

  // ── Tag bar chart data (all tags or single selected tag) ──────────────────
  const tagChartData = useMemo(() => {
    if (!data) return [];
    const tags = activeTag ? [activeTag] : allTags.slice(0, 20);
    return tags.map(t => ({
      tag: t,
      a: data.a.tagCounts[t] ?? 0,
      b: data.b.tagCounts[t] ?? 0,
    }));
  }, [data, activeTag, allTags]);

  // ── Head-to-head stat cards ───────────────────────────────────────────────
  const headToHead = data ? [
    { label: 'Current Rating', a: data.a.info.rating,    b: data.b.info.rating    },
    { label: 'Max Rating',     a: data.a.info.maxRating, b: data.b.info.maxRating },
    { label: 'Total Solved',   a: data.a.totalSolved,    b: data.b.totalSolved    },
    { label: 'Contests',       a: data.a.contestCount,   b: data.b.contestCount   },
  ] : [];

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-white/10">
            <Swords className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">CF Compare</h1>
            <p className="text-sm text-muted-foreground">Head-to-head Codeforces analysis</p>
          </div>
        </div>
      </motion.div>

      {/* ── Input Row ────────────────────────────────────────────────────────── */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Handle A */}
            <div className="flex-1 relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: COLOR_A }}
              />
              <Input
                className="pl-6 h-11 bg-background/50 border-border/60 font-medium"
                placeholder="Handle A  (e.g. tourist)"
                value={handleA}
                onChange={e => setHandleA(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && compare()}
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="px-3 py-1 rounded-full border border-border/50 text-xs font-bold text-muted-foreground bg-muted/40">
                VS
              </div>
            </div>

            {/* Handle B */}
            <div className="flex-1 relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{ backgroundColor: COLOR_B }}
              />
              <Input
                className="pl-6 h-11 bg-background/50 border-border/60 font-medium"
                placeholder="Handle B  (e.g. Petr)"
                value={handleB}
                onChange={e => setHandleB(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && compare()}
              />
            </div>

            <Button
              onClick={compare}
              disabled={loading || !handleA.trim() || !handleB.trim()}
              className="h-11 px-6 font-semibold shrink-0 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0"
            >
              {loading
                ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Fetching...</>
                : <><Zap className="h-4 w-4 mr-2" /> Compare</>}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-destructive text-center">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* ── Profile row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MiniProfile data={data.a} accent={COLOR_A} />
              <MiniProfile data={data.b} accent={COLOR_B} />
            </div>

            {/* ── Head-to-head stat cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {headToHead.map(({ label, a, b }) => {
                const aWins = a > b;
                const bWins = b > a;
                return (
                  <Card
                    key={label}
                    className="border-border/50 bg-card/60 text-center overflow-hidden relative"
                  >
                    {/* winner glow strip */}
                    <div
                      className="absolute top-0 inset-x-0 h-0.5"
                      style={{ background: aWins ? COLOR_A : bWins ? COLOR_B : 'transparent' }}
                    />
                    <CardContent className="p-4 space-y-2">
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                      <div className="flex items-center justify-center gap-3">
                        <StatNum value={a} color={COLOR_A} />
                        <span className="text-xs text-muted-foreground font-bold">:</span>
                        <StatNum value={b} color={COLOR_B} />
                      </div>
                      <Delta a={a} b={b} label={label} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ── Rating Bucket Bar Chart ────────────────────────────────── */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Problems by Rating</CardTitle>
                </div>
                <CardDescription>Solved count per difficulty bucket</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex gap-4 mb-4">
                  {[
                    { label: data.a.info.handle, color: COLOR_A },
                    { label: data.b.info.handle, color: COLOR_B },
                  ].map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  ))}
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bucketData} margin={{ top: 16, right: 10, bottom: 0, left: 0 }} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                      <XAxis dataKey="bucket" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} width={28} />
                      <Tooltip
                        content={<BucketTooltip />}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      />
                      <Bar
                        dataKey={data.a.info.handle}
                        fill={COLOR_A}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={36}
                        opacity={0.88}
                      >
                        <LabelList
                          dataKey={data.a.info.handle}
                          position="top"
                          style={{ fill: '#aaa', fontSize: 9, fontWeight: 600 }}
                          formatter={(v: any) => v || ''}
                        />
                      </Bar>
                      <Bar
                        dataKey={data.b.info.handle}
                        fill={COLOR_B}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={36}
                        opacity={0.88}
                      >
                        <LabelList
                          dataKey={data.b.info.handle}
                          position="top"
                          style={{ fill: '#aaa', fontSize: 9, fontWeight: 600 }}
                          formatter={(v: any) => v || ''}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ── Tag Comparison ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tag pill list */}
              <Card className="lg:col-span-4 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Topics</CardTitle>
                  </div>
                  <CardDescription>Click a tag to zoom in</CardDescription>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8 h-8 text-xs bg-background/50"
                      placeholder="Search tags…"
                      value={tagSearch}
                      onChange={e => setTagSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30 scrollbar-thin">
                    {/* "All tags" option */}
                    <button
                      onClick={() => setActiveTag(null)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors text-left ${
                        activeTag === null ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <BarChart2 className="h-3 w-3 shrink-0" /> All Topics (top 20)
                    </button>

                    {filteredTags.map(tag => {
                      const aVal = data.a.tagCounts[tag] ?? 0;
                      const bVal = data.b.tagCounts[tag] ?? 0;
                      const winner = aVal > bVal ? 'a' : bVal > aVal ? 'b' : null;
                      return (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs transition-colors text-left group ${
                            activeTag === tag ? 'bg-primary/10' : 'hover:bg-muted/40'
                          }`}
                        >
                          <span
                            className={`capitalize font-medium truncate ${
                              activeTag === tag ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'
                            }`}
                          >
                            {tag}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className="font-bold tabular-nums text-[11px]"
                              style={{ color: winner === 'a' ? COLOR_A : 'inherit' }}
                            >
                              {aVal}
                            </span>
                            <span className="text-muted-foreground text-[10px]">/</span>
                            <span
                              className="font-bold tabular-nums text-[11px]"
                              style={{ color: winner === 'b' ? COLOR_B : 'inherit' }}
                            >
                              {bVal}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tag bar chart */}
              <Card className="lg:col-span-8 border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {activeTag
                          ? <span>Tag: <span className="capitalize text-primary">{activeTag}</span></span>
                          : 'Top 20 Topics — Side by Side'}
                      </CardTitle>
                      <CardDescription>Problems solved per tag</CardDescription>
                    </div>
                    {activeTag && (
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setActiveTag(null)}
                        className="text-xs h-7"
                      >
                        ← All Topics
                      </Button>
                    )}
                  </div>
                  {/* mini legend */}
                  <div className="flex gap-4 mt-1">
                    {[
                      { label: data.a.info.handle, color: COLOR_A },
                      { label: data.b.info.handle, color: COLOR_B },
                    ].map(({ label, color }) => (
                      <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTag ? (
                    /* Single-tag: duel stat cards + problem lists */
                    <motion.div
                      key={activeTag}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 space-y-4"
                    >
                      {/* Duel count cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { handle: data.a.info.handle, val: data.a.tagCounts[activeTag] ?? 0, color: COLOR_A },
                          { handle: data.b.info.handle, val: data.b.tagCounts[activeTag] ?? 0, color: COLOR_B },
                        ].map(({ handle, val, color }, idx) => {
                          const other = idx === 0
                            ? (data.b.tagCounts[activeTag!] ?? 0)
                            : (data.a.tagCounts[activeTag!] ?? 0);
                          const isWinner = val > other;
                          const pct = val + other === 0 ? 50 : Math.round((val / (val + other)) * 100);
                          return (
                            <div
                              key={handle}
                              className="relative p-4 rounded-xl border overflow-hidden text-center space-y-2"
                              style={{ borderColor: `${color}30`, background: `${color}08` }}
                            >
                              {isWinner && (
                                <div className="absolute top-2 right-2">
                                  <Trophy className="h-4 w-4" style={{ color }} />
                                </div>
                              )}
                              <div className="text-sm font-bold truncate" style={{ color }}>{handle}</div>
                              <div className="text-4xl font-extrabold tabular-nums" style={{ color }}>{val}</div>
                              <div className="text-xs text-muted-foreground capitalize">{activeTag} solved</div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                              </div>
                              <div className="text-xs text-muted-foreground">{pct}%</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Problem lists — side by side */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { handle: data.a.info.handle, problems: data.a.tagProblems?.[activeTag!] ?? [], color: COLOR_A },
                          { handle: data.b.info.handle, problems: data.b.tagProblems?.[activeTag!] ?? [], color: COLOR_B },
                        ].map(({ handle, problems, color }) => (
                          <div key={handle} className="rounded-xl border overflow-hidden" style={{ borderColor: `${color}20` }}>
                            {/* List header */}
                            <div
                              className="px-3 py-2 flex items-center gap-2 border-b"
                              style={{ borderColor: `${color}20`, background: `${color}0a` }}
                            >
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                              <span className="text-xs font-semibold truncate" style={{ color }}>{handle}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                                {problems.length} problem{problems.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Scrollable rows */}
                            <div className="overflow-y-auto max-h-64 divide-y divide-border/20">
                              {problems.length === 0 ? (
                                <div className="px-3 py-6 text-center text-xs text-muted-foreground">None solved yet</div>
                              ) : (
                                problems.map((p: SolvedProblem) => (
                                  <a
                                    key={`${p.contestId}-${p.index}`}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors group"
                                  >
                                    {/* Rating badge */}
                                    <span
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 tabular-nums"
                                      style={{
                                        background: p.rating
                                          ? p.rating <= 1200 ? '#22c55e20'
                                          : p.rating <= 1800 ? '#f59e0b20'
                                          : '#ef444420'
                                          : '#88888820',
                                        color: p.rating
                                          ? p.rating <= 1200 ? '#22c55e'
                                          : p.rating <= 1800 ? '#f59e0b'
                                          : '#ef4444'
                                          : '#888',
                                      }}
                                    >
                                      {p.rating ?? '?'}
                                    </span>

                                    {/* Problem name */}
                                    <span className="text-xs truncate flex-1 group-hover:text-primary transition-colors">
                                      {p.name}
                                    </span>

                                    {/* External link icon */}
                                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                                  </a>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    /* Top-20 horizontal grouped bar chart */
                    <div style={{ width: '100%', height: 460 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tagChartData}
                          layout="vertical"
                          margin={{ left: 0, right: 40, top: 4, bottom: 0 }}
                          barGap={2}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.08} />
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="tag"
                            type="category"
                            width={130}
                            tick={{ fontSize: 10, fill: '#888' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v}
                          />
                          <Tooltip
                            content={<TagTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          />
                          <Bar dataKey="a" name={data.a.info.handle} fill={COLOR_A} radius={[0, 5, 5, 0]} barSize={10} opacity={0.88}>
                            <LabelList
                              dataKey="a"
                              position="right"
                              style={{ fill: '#aaa', fontSize: 9 }}
                              formatter={(v: any) => v || ''}
                            />
                          </Bar>
                          <Bar dataKey="b" name={data.b.info.handle} fill={COLOR_B} radius={[0, 5, 5, 0]} barSize={10} opacity={0.88}>
                            <LabelList
                              dataKey="b"
                              position="right"
                              style={{ fill: '#aaa', fontSize: 9 }}
                              formatter={(v: any) => v || ''}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Overall winner banner ────────────────────────────────────── */}
            {(() => {
              const scoreA = headToHead.filter(s => s.a > s.b).length;
              const scoreB = headToHead.filter(s => s.b > s.a).length;
              const winner = scoreA > scoreB ? data.a : scoreB > scoreA ? data.b : null;
              const color  = scoreA > scoreB ? COLOR_A : scoreB > scoreA ? COLOR_B : '#888';
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card
                    className="border overflow-hidden"
                    style={{ borderColor: `${color}30`, background: `linear-gradient(135deg, ${color}10, transparent)` }}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <Trophy className="h-8 w-8 shrink-0" style={{ color }} />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Overall Leader</p>
                        <p className="text-xl font-extrabold" style={{ color }}>
                          {winner ? winner.info.handle : 'It\'s a Tie!'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {winner
                            ? `Leading in ${scoreA > scoreB ? scoreA : scoreB} / 4 categories`
                            : 'Perfect statistical match across all categories'}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-3xl font-extrabold">
                          <span style={{ color: COLOR_A }}>{scoreA}</span>
                          <span className="text-muted-foreground mx-2 text-xl">:</span>
                          <span style={{ color: COLOR_B }}>{scoreB}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">category wins</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-white/10 flex items-center justify-center">
            <Swords className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground">No comparison yet</p>
            <p className="text-sm text-muted-foreground/60">Enter two Codeforces handles above and hit Compare</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto text-xs">
            {['Rating buckets', 'Tag analysis', 'Head-to-head stats', 'Overall winner'].map(f => (
              <span key={f} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border/50 text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-primary" /> {f}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
