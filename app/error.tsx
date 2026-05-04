'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/mascot/Mascot';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[var(--color-bg)] overflow-hidden relative p-6 rounded-3xl m-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-surface)] -z-20 border border-[var(--color-border)] rounded-3xl" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6cbfd0]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fbdf74]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
          className="relative inline-block mb-8"
        >
          {/* Mascot in sleeping/sad state for error */}
          <div className="flex justify-center mb-6">
            <Mascot state="sleeping" size={120} />
          </div>
          <h1 className="text-5xl md:text-7xl font-normal font-display text-transparent bg-clip-text bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] tracking-tight">
            System Alert
          </h1>
        </motion.div>

        <h2 className="text-xl md:text-2xl font-normal font-display text-[var(--color-text-primary)] mb-4">
          เกิดข้อผิดพลาดในการแสดงผลข้อมูล
        </h2>
        
        <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed tracking-wide">
          ระบบไม่สามารถประมวลผลข้อมูลในส่วนนี้ได้ชั่วคราว<br />
          อาจเกิดจากข้อขัดข้องทางการเชื่อมต่อหรือข้อมูลไม่สมบูรณ์<br />
          <span className="text-[10px] mt-4 block opacity-50 font-mono">
            {error.digest ? `Error Digest: ${error.digest}` : 'Internal Client Error'}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => reset()}
            className="px-8 py-3.5 bg-[var(--color-text-primary)] text-[var(--color-bg)] text-sm font-bold tracking-wider uppercase rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
          >
            ลองใหม่อีกครั้ง
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/'}
            className="px-8 py-3.5 bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)] text-sm font-bold tracking-wider uppercase rounded-full transition-all w-full sm:w-auto"
          >
            กลับหน้าแรก
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
