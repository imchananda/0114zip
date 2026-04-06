'use client';

import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer
      className="border-t border-[var(--color-border)] py-20 transition-colors duration-300"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h3 className="text-[var(--color-text-primary)] text-3xl font-light tracking-[0.2em] mb-4">
          Namtan
          <span
            className="mx-2"
            style={{
              background: 'linear-gradient(135deg, #1E88E5, #FDD835)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ×
          </span>
          Film
        </h3>

        <p className="text-[var(--color-text-muted)] text-sm font-light tracking-wider mb-8 font-thai">
          สร้างด้วยความรักจากแฟนคลับ
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {['Twitter', 'Instagram', 'TikTok'].map((social) => (
            <motion.a
              key={social}
              href="#"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs tracking-widest transition-colors"
              whileHover={{ y: -2 }}
            >
              {social}
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-24 h-px mx-auto mb-8"
          style={{
            background: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
          }}
        />

        {/* Copyright */}
        <p className="text-[var(--color-text-muted)] text-xs tracking-wider font-thai opacity-60">
          © 2024 Fan Project · ไม่ได้เกี่ยวข้องกับต้นสังกัด
        </p>
      </div>
    </footer>
  );
}
