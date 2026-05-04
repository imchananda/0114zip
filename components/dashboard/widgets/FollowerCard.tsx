import { LiveDashboardConfig, fmtFol, NT, FL } from '../LiveDashboardTypes';

export function BarRow({ label, val, color, max, mounted }: {
  label: string; val: number; color: string; max: number; mounted: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>
          {mounted ? fmtFol(val) : '—'}
        </span>
      </div>
      <div className="h-1 w-full bg-theme/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 delay-300 shadow-sm"
          style={{
            width:      mounted ? `${Math.max(6, (val / Math.max(max, 1)) * 100)}%` : '0%',
            background: color,
          }}
        />
      </div>
    </div>
  );
}

export function FollowerCard({
  title, platformKey, icon, ntVal, flVal, max, mounted, cfg, showNt, showFl,
}: {
  title: string;
  platformKey: string;
  icon: string;
  ntVal: number;
  flVal: number;
  max: number;
  mounted: boolean;
  cfg: LiveDashboardConfig;
  showNt: boolean;
  showFl: boolean;
}) {
  return (
    <div className="p-5 flex flex-col h-full">
      <p className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[var(--color-text-muted)] mb-3">{title}</p>
      {cfg.showFollowerSection && cfg.showPlatforms.includes(platformKey) ? (
        <div className="flex-1 flex flex-col justify-center gap-4">
          {showNt && <BarRow label="น้ำตาล" val={ntVal} color={NT} max={max} mounted={mounted} />}
          {showFl && <BarRow label="ฟิล์ม"  val={flVal} color={FL} max={max} mounted={mounted} />}
        </div>
      ) : <div className="flex-1 flex items-center justify-center text-[9px] text-[var(--color-text-muted)]">—</div>}
      <p className="text-[9px] font-medium text-[var(--color-text-muted)] mt-2">{icon} ผู้ติดตาม</p>
    </div>
  );
}
