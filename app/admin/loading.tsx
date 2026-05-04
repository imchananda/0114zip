import { LoadingFallback } from '@/components/ui/LoadingFallback';

export default function AdminLoading() {
  return (
    <div className="flex w-full items-center justify-center p-12 min-h-[60vh]">
      <LoadingFallback message="Loading Admin Data..." />
    </div>
  );
}
