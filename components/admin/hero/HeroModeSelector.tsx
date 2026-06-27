import type { HeroBannerConfig } from '@/lib/homepage-data';

const MODE_OPTIONS: Array<{ value: HeroBannerConfig['type']; label: string; description: string }> = [
  { value: 'cinematic', label: '✨ Cinematic', description: 'ภาพเดียว + เอฟเฟกต์ cinematic' },
  { value: 'slide', label: '🖼️ Slide', description: 'สลับหลายภาพจาก Hero Slides' },
  { value: 'video', label: '🎥 Video', description: 'พื้นหลังวิดีโอ' },
  { value: 'image', label: '📸 Image', description: 'ภาพเดี่ยวแบบ static' },
];

interface HeroModeSelectorProps {
  value: HeroBannerConfig['type'];
  onChange: (nextType: HeroBannerConfig['type']) => void;
}

export function HeroModeSelector({ value, onChange }: HeroModeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text-primary)]">โหมด Hero</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MODE_OPTIONS.map((mode) => {
          const active = value === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange(mode.value)}
              data-testid={`hero-mode-option-${mode.value}`}
              className={`rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                active
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-accent)]/60'
              }`}
              aria-pressed={active}
            >
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{mode.label}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{mode.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

