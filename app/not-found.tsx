'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/mascot/Mascot';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] overflow-hidden relative">

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1E88E5]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FDD835]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="relative inline-block"
        >
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E88E5] to-[#FDD835] drop-shadow-2xl opacity-90 tracking-tighter">
            404
          </h1>
          {/* Mascot on top-right of 404 */}
          <div className="absolute -top-8 -right-12">
            <Mascot state="excited" size={80} />
          </div>
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mt-4 mb-2">
          อุ๊ปส์! คุณน่าจะหลงทางแล้วล่ะ
        </h2>
        <p className="text-[var(--color-muted)] max-w-md mx-auto mb-10 text-lg">
          หาหน้าเว็บไซต์ที่คุณต้องการไม่พบ อาจจะโดนลบไปแล้ว หรือคุณพิมพ์ URL ผิด<br />
          กลับไปตามหาฟิล์มและน้ำตาลต่อที่หน้าแรกกันดีกว่า!
        </p>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#1E88E5] to-[#FDD835] text-gray-900 font-bold rounded-full shadow-xl shadow-[#1E88E5]/20 hover:shadow-2xl hover:shadow-[#FDD835]/30 transition-all"
          >
            ← กลับสู่หน้าแรก (Home)
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
