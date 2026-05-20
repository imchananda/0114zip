/** Shared admin builder button styles (Phase 5) */
export function optionButtonClass(active: boolean): string {
  return active
    ? 'bg-[#6cbfd0]/20 text-[#6cbfd0] border-[#6cbfd0]/40 shadow-sm'
    : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[#6cbfd0]/30';
}

export function resetOutlineButtonClass(): string {
  return 'text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/30 transition-colors';
}
