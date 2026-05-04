'use client';

import { useEffect } from 'react';
import { Mascot } from '@/components/mascot/Mascot';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <Mascot state="sleeping" size={120} showCaption={false} />
      
      <div className="space-y-2">
        <h2 className="text-2xl font-display text-[var(--color-primary)]">
          อุ๊ย! มีบางอย่างผิดพลาด 🐼
        </h2>
        <p className="text-[var(--color-muted)] max-w-md mx-auto">
          ดูเหมือนระบบจะเจอปัญหาเล็กน้อยระหว่างการดึงข้อมูล 
          ลองใหม่อีกครั้ง หรือกลับมาใหม่ภายหลังนะครับ
        </p>
      </div>

      <button 
        onClick={() => reset()}
        className="mt-4 bg-nf-gradient text-white rounded-full px-8 py-2 font-medium hover:opacity-90 transition-opacity"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
