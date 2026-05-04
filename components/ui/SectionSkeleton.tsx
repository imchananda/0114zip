export const SectionSkeleton = () => (
  <div className="w-full py-24 md:py-32 animate-pulse bg-[var(--color-bg)]">
    <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-12">
      <div className="space-y-4 border-b border-theme/20 pb-8">
        <div className="h-3 w-32 rounded-full bg-theme/20" />
        <div className="h-12 w-80 rounded-2xl bg-theme/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-72 rounded-[2rem] bg-theme/5" />
        <div className="h-72 rounded-[2rem] bg-theme/5" />
        <div className="h-72 rounded-[2rem] bg-theme/5" />
      </div>
    </div>
  </div>
);
