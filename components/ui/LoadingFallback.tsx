'use client';

import { Mascot } from '@/components/mascot/Mascot';

export function LoadingFallback({ message = "กำลังโหลดข้อมูล..." }: { message?: string }) {
  return (
    <div className="flex w-full items-center justify-center p-12 min-h-[300px]">
      <Mascot state="sleeping" showCaption caption={message} size={100} />
    </div>
  );
}
