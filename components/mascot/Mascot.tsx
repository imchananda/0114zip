'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import Image from 'next/image';

interface MascotProps {
  state?: 'idle' | 'excited' | 'sleeping' | 'waving';
  size?: number;
  className?: string;
  caption?: string;
  showCaption?: boolean;
}

const STATE_ANIMATIONS: Record<string, { animate: TargetAndTransition; transition: object }> = {
  idle: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  excited: {
    animate: { y: [0, -12, 0], rotate: [-3, 3, -3] },
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
  },
  sleeping: {
    animate: { rotate: [-2, 2, -2], scale: [1, 1.02, 1] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  waving: {
    animate: { rotate: [0, 15, -5, 15, 0] },
    transition: { duration: 1, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' },
  },
};

const STATE_CAPTIONS = {
  idle:     'สวัสดี! 🐼',
  excited:  'เย้! สนุกมากเลย! 🎉',
  sleeping: 'zzz... ยังโหลดอยู่นะ 💤',
  waving:   'มาแล้ว! ยินดีต้อนรับ 👋',
};

export function Mascot({
  state = 'idle',
  size = 80,
  className = '',
  caption,
  showCaption = false,
}: MascotProps) {
  const anim = STATE_ANIMATIONS[state];
  const defaultCaption = caption || STATE_CAPTIONS[state as keyof typeof STATE_CAPTIONS];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        animate={anim.animate}
        transition={anim.transition}
        style={{ width: size, height: size }}
        className="relative cursor-default select-none"
        title={defaultCaption}
      >
        <Image
          src="/mascot/panda-duck.png"
          alt="🐼🦆 Panda-Duck Mascot"
          width={size}
          height={size}
          className="object-contain drop-shadow-md"
          priority={false}
        />

        {/* Sleeping ZZZ overlay */}
        {state === 'sleeping' && (
          <motion.span
            className="absolute -top-2 -right-2 text-xs font-bold text-blue-300"
            animate={{ opacity: [0, 1, 0], y: [0, -8, -16] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
          >
            z
          </motion.span>
        )}
      </motion.div>

      {showCaption && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--color-muted)] text-center"
        >
          {defaultCaption}
        </motion.p>
      )}
    </div>
  );
}
