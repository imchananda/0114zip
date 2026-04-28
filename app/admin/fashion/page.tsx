'use client';

import Link from 'next/link';

export default function AdminFashionPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-1 mb-8 pb-4 border-b border-[var(--color-border)]">
        <Link href="/admin/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 w-fit">
          ← Dashboard
        </Link>
        <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
          👗 Fashions
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">จัดการข้อมูลแฟชั่นของน้ำตาลและฟิล์ม</p>
      </div>
      <div className="text-center py-20 border border-[var(--color-border)] rounded-2xl border-dashed text-[var(--color-text-muted)]">
        <p className="text-4xl mb-3">👗</p>
        <p className="text-sm">ส่วนนี้กำลังอยู่ระหว่างพัฒนา</p>
      </div>
    </div>
  );
}
