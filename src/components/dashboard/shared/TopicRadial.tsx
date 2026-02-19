'use client';

interface TopicRadialItem {
  name: string;
  solved: number;
  color: string;
}

interface TopicRadialProps {
  topics: TopicRadialItem[];
  title?: string;
  description?: string;
  maxOverride?: number; // optional max for normalization
}

function RadialCircle({ name, solved, color, max }: TopicRadialItem & { max: number }) {
  const pct = max > 0 ? Math.min(100, (solved / max) * 100) : 0;
  const degrees = (pct / 100) * 360;

  return (
    <div className="flex flex-col items-center gap-2 group">
      {/* Outer conic ring */}
      <div
        className="relative rounded-full p-[3px] transition-transform duration-200 group-hover:scale-105"
        style={{
          background: `conic-gradient(${color} ${degrees}deg, rgba(255,255,255,0.06) ${degrees}deg)`,
          width: 64,
          height: 64,
        }}
      >
        {/* Inner dark ring */}
        <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
          <span
            className="text-[13px] font-extrabold tabular-nums"
            style={{ color }}
          >
            {solved}
          </span>
        </div>
      </div>
      {/* Label */}
      <span className="text-[10px] text-muted-foreground text-center capitalize leading-tight max-w-[64px] truncate">
        {name}
      </span>
    </div>
  );
}

export function TopicRadial({ topics, maxOverride }: TopicRadialProps) {
  if (!topics || topics.length === 0) return null;

  const max = maxOverride ?? Math.max(...topics.map(t => t.solved), 1);

  return (
    <div className="flex flex-wrap gap-4 justify-start py-1">
      {topics.map(t => (
        <RadialCircle key={t.name} {...t} max={max} />
      ))}
    </div>
  );
}
