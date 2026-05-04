import { LoadingFallback } from '@/components/ui/LoadingFallback';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[var(--color-bg)] pt-20">
      <LoadingFallback />
    </div>
  );
}
