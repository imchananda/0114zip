'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import { clearGlobalCacheAction } from '@/app/admin/actions';

type NavItem = { href: string; icon: string; label: string; superOnly?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'ภาพรวม',
    items: [
      { href: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    ],
  },
  {
    label: 'จัดการข้อมูลศิลปิน',
    items: [
      { href: '/admin/profile',   icon: '📋', label: 'Profile' },
      { href: '/admin/schedule',  icon: '📅', label: 'Schedule' },
      { href: '/admin/content',   icon: '📝', label: 'Content' },
      { href: '/admin/fashion',   icon: '👗', label: 'Fashions' },
      { href: '/admin/awards',    icon: '🏆', label: 'Awards' },
      { href: '/admin/timeline',  icon: '📖', label: 'Timeline' },
    ],
  },
  {
    label: 'กิจกรรมแฟนคลับ',
    items: [
      { href: '/admin/media',                       icon: '🎞️', label: 'Media & Tags'     },
      { href: '/admin/social-stats',                icon: '📊', label: 'Live Stats'        },
      { href: '/admin/social-stats/snapshots',      icon: '📈', label: 'Follower History'  },
      { href: '/admin/social-stats/ig-posts',       icon: '📷', label: 'IG Posts & EMV'   },
      { href: '/admin/brands',                      icon: '🏷️', label: 'Brand Collabs'    },
      { href: '/admin/challenges',                  icon: '🎯', label: 'Challenges'        },
      { href: '/admin/prizes',        icon: '🎁', label: 'Prizes' },
      { href: '/admin/notifications', icon: '🔔', label: 'Alerts' },
    ],
  },
  {
    label: 'ระบบ',
    items: [
      { href: '/admin/hero-slides',     icon: '🖼️', label: 'Hero Banner'      },
      { href: '/admin/live-dashboard',  icon: '📊', label: 'Live Dashboard'    },
      { href: '/admin/banners',         icon: '🎨', label: 'Banners'           },
      { href: '/admin/footer',    icon: '🦶', label: 'Footer' },
      { href: '/admin/floating-artist-selector', icon: '🎭', label: 'Floating Artist' },
      { href: '/admin/homepage-builder', icon: '🏠', label: 'Page Builder' },
      { href: '/admin/users',     icon: '👥', label: 'Users', superOnly: true },
      { href: '/admin/settings',  icon: '⚙️', label: 'Settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClearCache = () => {
    startTransition(async () => {
      const result = await clearGlobalCacheAction();
      if (result.success) {
        alert('✅ ล้างแคชสำเร็จ! หน้าเว็บจะแสดงข้อมูลล่าสุดทันที');
      } else {
        alert('❌ ไม่สามารถล้างแคชได้: ' + result.error);
      }
    });
  };

  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.superOnly || isSuperAdmin),
  })).filter(group => group.items.length > 0);

  const allItems = filteredGroups.flatMap(g => g.items);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-surface border-r border-theme/60 transition-all duration-500 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-8 border-b border-theme/30">
          {!collapsed && (
            <Link href="/admin/dashboard" className="font-display text-xl font-light tracking-tight truncate group">
              <span className="nf-gradient-text font-bold">NTF</span>
              <span className="text-muted/60 ml-2 text-xs font-bold uppercase tracking-widest">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl bg-panel/40 hover:bg-panel text-muted hover:text-primary transition-all duration-300 shadow-sm shrink-0 border border-theme/40"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-8 scrollbar-hide">
          {filteredGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              {!collapsed && (
                <p className="px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-muted opacity-40">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                        isActive
                          ? 'bg-deep-dark text-white border-deep-dark shadow-lg'
                          : 'text-muted border-transparent hover:bg-panel/60 hover:text-primary'
                      }`}
                    >
                      <span className="text-lg shrink-0 w-6 text-center grayscale-[0.5] group-hover:grayscale-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-6 border-t border-theme/40 bg-panel/10 space-y-2">
          <button
            onClick={handleClearCache}
            disabled={isPending}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:bg-[var(--namtan-teal)] hover:text-white transition-all duration-300 border border-transparent disabled:opacity-50"
          >
            <span className={`text-lg shrink-0 w-6 text-center ${isPending ? 'animate-spin' : ''}`}>⚡</span>
            {!collapsed && <span>{isPending ? 'Clearing...' : 'Clear Cache'}</span>}
          </button>

          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:bg-accent hover:text-deep-dark transition-all duration-300 border border-transparent hover:border-accent"
          >
            <span className="text-lg shrink-0 w-6 text-center grayscale opacity-60">🌐</span>
            {!collapsed && <span>Web Portal</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-2xl border-t border-theme safe-area-bottom shadow-2xl">
        <div className="flex overflow-x-auto no-scrollbar py-1">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 min-w-[70px] px-2 py-3 text-center transition-all shrink-0 ${
                  isActive
                    ? 'text-accent scale-110'
                    : 'text-muted opacity-60'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest truncate w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}
