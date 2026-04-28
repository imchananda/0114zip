'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HashtagsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/media?tab=hashtags'); }, [router]);
  return null;
}