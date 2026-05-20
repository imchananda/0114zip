'use client';

import type { HomepageSectionId } from '@/lib/homepage-sections';
import {
  formatSectionMotionSummary,
  MOTION_INTENSITY_OPTIONS,
  MOTION_PRESET_OPTIONS,
  MOTION_STAGGER_OPTIONS,
  normalizeSectionMotion,
  type MotionIntensity,
  type MotionPreset,
  type MotionStaggerMode,
  type PageMotionConfig,
  type SectionMotionConfig,
} from '@/lib/visual/motion';
import { optionButtonClass } from './builderUi';

type SectionMotionEditorProps = {
  sectionKey: HomepageSectionId;
  value: SectionMotionConfig | undefined;
  pageMotion: PageMotionConfig;
  onChange: (patch: Partial<SectionMotionConfig>) => void;
};

export function SectionMotionEditor({
  sectionKey,
  value,
  pageMotion,
  onChange,
}: SectionMotionEditorProps) {
  const motion = normalizeSectionMotion(value);
  const allowCinematic = sectionKey === 'about' || sectionKey === 'profile';
  const presetOptions = MOTION_PRESET_OPTIONS.filter(
    (opt) => opt.value !== 'cinematic' || allowCinematic,
  );
  const showStagger = motion.preset === 'stagger-cards' || motion.preset === 'inherit';

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] flex items-center gap-2">
        ✨ Section Motion
        <span className="font-normal normal-case tracking-normal text-[10px] opacity-70">
          ({formatSectionMotionSummary(motion, pageMotion)})
        </span>
      </p>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {presetOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preset: opt.value as MotionPreset })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.preset ?? 'inherit') === opt.value)}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {!allowCinematic && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-2 opacity-70">
            Cinematic preset is limited to hero/editorial sections (About, Profile).
          </p>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Intensity
        </label>
        <div className="flex gap-2 flex-wrap">
          {MOTION_INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ intensity: opt.value as MotionIntensity })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.intensity ?? 'inherit') === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showStagger && (
        <div>
          <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
            Stagger children
          </label>
          <div className="flex gap-2 flex-wrap">
            {MOTION_STAGGER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ stagger: opt.value as MotionStaggerMode })}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass((motion.stagger ?? 'inherit') === opt.value)}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
