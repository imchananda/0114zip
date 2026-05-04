export function DonutChart({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r    = 15.9;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none"
          stroke="var(--color-border)" strokeWidth="3.5" opacity="0.4" />
        <circle cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-primary">{pct}%</span>
      </div>
    </div>
  );
}

export function MultiDonut({ segments, size = 64 }: {
  segments: { pct: number; color: string }[];
  size?: number;
}) {
  const r    = 15.9;
  const circ = 2 * Math.PI * r;
  const offsets = segments.map((_, i) =>
    segments.slice(0, i).reduce((sum, seg) => sum + seg.pct, 0)
  );
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none"
        stroke="var(--color-border)" strokeWidth="4" opacity="0.4" />
      {segments.map((s, i) => {
        const dash    = (s.pct / 100) * circ;
        const dashOff = -((offsets[i] ?? 0) / 100) * circ;
        return (
          <circle key={i} cx="18" cy="18" r={r} fill="none"
            stroke={s.color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={dashOff} />
        );
      })}
    </svg>
  );
}
