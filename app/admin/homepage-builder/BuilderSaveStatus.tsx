'use client';

type BuilderSaveStatusProps = {
  isDirty: boolean;
  hasBlockingErrors: boolean;
  blockingReason?: string;
};

export function BuilderSaveStatus({
  isDirty,
  hasBlockingErrors,
  blockingReason,
}: BuilderSaveStatusProps) {
  if (hasBlockingErrors && blockingReason) {
    return (
      <p className="text-[11px] text-red-500 text-right max-w-xs leading-relaxed">
        {blockingReason}
      </p>
    );
  }

  if (isDirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
        Unsaved changes
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] opacity-70">
      Saved
    </span>
  );
}

export function getSaveDisabledReason(options: {
  saving: boolean;
  isPending: boolean;
  hasBlockingErrors: boolean;
  blockingReason?: string;
  isDirty: boolean;
}): string | undefined {
  if (options.saving) return 'กำลังบันทึก...';
  if (options.isPending) return 'กำลังล้างแคช...';
  if (options.hasBlockingErrors && options.blockingReason) return options.blockingReason;
  if (!options.isDirty) return 'ไม่มีการเปลี่ยนแปลงที่ต้องบันทึก';
  return undefined;
}
