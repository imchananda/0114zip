'use client';

import {
  PAGE_MOTION_INTENSITY_OPTIONS,
  PAGE_MOTION_PRESET_OPTIONS,
  type PageMotionConfig,
  type PageMotionIntensity,
  type PageMotionPreset,
} from '@/lib/visual/motion';
import { optionButtonClass, resetOutlineButtonClass } from './builderUi';

type PageMotionEditorProps = {
  value: PageMotionConfig;
  onChange: (patch: Partial<PageMotionConfig>) => void;
  onReset?: () => void;
};

export function PageMotionEditor({ value, onChange, onReset }: PageMotionEditorProps) {
  return (
    <div className="space-y-5">
      {onReset && (
        <div className="flex justify-end">
          <button type="button" onClick={onReset} className={resetOutlineButtonClass()}>
            Reset page motion
          </button>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Preset
        </label>
        <div className="flex gap-2 flex-wrap">
          {PAGE_MOTION_PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ preset: opt.value as PageMotionPreset })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass(value.preset === opt.value)}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
          Intensity
        </label>
        <div className="flex gap-2 flex-wrap">
          {PAGE_MOTION_INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ intensity: opt.value as PageMotionIntensity })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${optionButtonClass(value.intensity === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
