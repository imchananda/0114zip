'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { TimelineEvent } from '@/data/timeline';

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  all:       { label: 'ทั้งหมด',   emoji: '📋', color: '#ffffff' },
  milestone: { label: 'เหตุการณ์',  emoji: '💫', color: '#A78BFA' },
  work:      { label: 'ผลงาน',     emoji: '🎬', color: '#6cbfd0' },
  award:     { label: 'รางวัล',     emoji: '🏆', color: '#fbdf74' },
  event:     { label: 'กิจกรรม',   emoji: '🎉', color: '#EF5350' },
  debut:     { label: 'เดบิวต์',    emoji: '⭐', color: '#66BB6A' },
};

export default function TimelinePage() {
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [actorFilter, setActorFilter] = useState<'all' | 'namtan' | 'film' | 'both'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const yearRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/timeline')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Map snake_case API → camelCase TimelineEvent
          setAllEvents(data.map((row: any) => ({ ...row, titleThai: row.title_thai ?? '' })));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
  }, []);

  // Mobile horizontal mode
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const events = useMemo(() => {
    let filtered = allEvents;
    if (actorFilter === 'both') {
      filtered = allEvents.filter(e => e.actor === 'both');
    } else if (actorFilter === 'namtan' || actorFilter === 'film') {
      filtered = allEvents.filter(e => e.actor === actorFilter || e.actor === 'both');
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }
    return filtered;
  }, [allEvents, actorFilter, categoryFilter]);

  // Group by year
  const grouped = useMemo(() => {
    return events.reduce((acc, ev) => {
      if (!acc[ev.year]) acc[ev.year] = [];
      acc[ev.year].push(ev);
      return acc;
    }, {} as Record<number, TimelineEvent[]>);
  }, [events]);

  const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  // Track active year on scroll
  useEffect(() => {
    if (years.length > 0 && activeYear === null) {
      setActiveYear(years[years.length - 1]); // Default to latest year
    }
  }, [years, activeYear]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const year = Number(entry.target.getAttribute('data-year'));
            if (year) setActiveYear(year);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    Object.values(yearRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [events]);

  const scrollToYear = (year: number) => {
    const el = yearRefs.current[year];
    if (el) {
      const offset = 120; // account for sticky header
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveYear(year);
    }
  };

  const actorsFilter = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'both', label: 'ผลงานคู่' },
    { id: 'namtan', label: 'น้ำตาล' },
    { id: 'film', label: 'ฟิล์ม' },
  ];

  const getActorGradient = (actor: string) => {
    if (actor === 'both') return 'from-[#6cbfd0] to-[#fbdf74]';
    if (actor === 'namtan') return 'from-[#6cbfd0] to-blue-400';
    return 'from-[#fbdf74] to-yellow-400';
  };

  const getActorDotColor = (actor: string) => {
    if (actor === 'both') return '#fbdf74';
    if (actor === 'namtan') return '#6cbfd0';
    return '#fbdf74';
  };

  if (loadingEvents) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[var(--color-bg)] pt-24 flex items-center justify-center">
          <p className="text-[var(--color-text-muted)] animate-pulse">กำลังโหลด Timeline...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-bg)] pt-24 pb-20 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#6cbfd0]/10 to-[#fbdf74]/5 rounded-full blur-3xl -z-10 pointer-events-none opacity-50" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-[var(--color-text)] mb-4 tracking-wide">
              เส้นทางแห่งความทรงจำ
            </h1>
            <p className="text-[var(--color-muted)] max-w-xl mx-auto mb-6">
              ย้อนรอยดูเหตุการณ์สำคัญ ผลงาน และรางวัลต่างๆ ตั้งแต่วันแรกจนถึงปัจจุบัน
            </p>

            {/* Artist Filters */}
            <div className="inline-flex bg-black/40 border border-white/10 rounded-full p-1.5 backdrop-blur-md flex-wrap justify-center gap-1 mb-4">
              {actorsFilter.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActorFilter(f.id as any)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    actorFilter === f.id
                      ? 'bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] shadow-md'
                      : 'text-[var(--color-muted)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const active = categoryFilter === key;
                const count = key === 'all' 
                  ? events.length 
                  : events.filter(e => e.category === key).length;
                
                if (key !== 'all' && count === 0) return null;
                
                return (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      active
                        ? 'text-white border-white/30 shadow-md'
                        : 'text-[var(--color-muted)] border-transparent hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? { background: `${config.color}20`, borderColor: `${config.color}50` } : {}}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                    <span className="text-[10px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Quick-Nav Pills */}
          {years.length > 0 && (
            <div className="sticky top-[72px] z-20 mb-8">
              <div className="flex justify-center">
                <div className="inline-flex gap-1 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 shadow-2xl overflow-x-auto max-w-full scrollbar-hide">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => scrollToYear(year)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        activeYear === year
                          ? 'bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] text-[#141413] shadow-md'
                          : 'text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Content */}
          <div ref={containerRef} className="relative">
            {/* Center line (Desktop) */}
            {!isMobile && (
              <div className="absolute left-[24px] md:left-1/2 top-4 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent md:-translate-x-1/2" />
            )}

            <AnimatePresence mode="popLayout">
              {years.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 text-[var(--color-muted)]"
                >
                  <div className="text-5xl mb-4">🕰️</div>
                  <p className="text-lg">ไม่พบข้อมูลไทม์ไลน์ตามตัวกรอง</p>
                  <button 
                    onClick={() => { setActorFilter('all'); setCategoryFilter('all'); }}
                    className="mt-4 px-5 py-2 bg-white/10 rounded-full text-sm hover:bg-white/15 transition-colors"
                  >
                    ล้างตัวกรอง
                  </button>
                </motion.div>
              ) : years.map((year) => (
                <div 
                  key={year} 
                  className="mb-16"
                  ref={(el) => { yearRefs.current[year] = el; }}
                  data-year={year}
                >
                  {/* Sticky Year Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex md:justify-center mb-8 ml-10 md:ml-0"
                  >
                    <span className="px-6 py-2 bg-black/80 backdrop-blur-md border border-[var(--color-border)] rounded-full text-2xl font-light tracking-widest text-white shadow-xl">
                      {year}
                    </span>
                  </motion.div>

                  {/* Mobile: Horizontal Scroll Cards */}
                  {isMobile ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-hide -mx-4">
                      {grouped[year].map((event, eIdx) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: eIdx * 0.08, duration: 0.4 }}
                          className="snap-center shrink-0 w-[280px] first:ml-4 last:mr-4"
                        >
                          <TimelineCard event={event} getActorGradient={getActorGradient} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Desktop: Alternating left/right */
                    <div className="space-y-12">
                      {grouped[year].map((event, eIdx) => {
                        const isLeft = eIdx % 2 === 0;
                        return (
                          <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`relative flex items-center gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                          >
                            {/* Timeline Dot */}
                            <div 
                              className="absolute left-[24px] md:left-1/2 w-[14px] h-[14px] rounded-full border-2 border-[var(--color-bg)] shadow-[0_0_10px_rgba(255,255,255,0.3)] z-10" 
                              style={{
                                background: `linear-gradient(135deg, ${getActorDotColor(event.actor)}, ${event.actor === 'both' ? '#6cbfd0' : getActorDotColor(event.actor)})`,
                                marginLeft: '-7px',
                              }}
                            />

                            {/* Content */}
                            <div className={`flex-1 pl-14 md:pl-0 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                              <TimelineCard event={event} getActorGradient={getActorGradient} align={isLeft ? 'right' : 'left'} />
                            </div>
                            
                            {/* Spacer */}
                            <div className="hidden md:block flex-1" />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Scrollbar hide style */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </main>
    </>
  );
}

// ── Timeline Card Component ──────────────────────────────
function TimelineCard({ 
  event, 
  getActorGradient, 
  align 
}: { 
  event: TimelineEvent; 
  getActorGradient: (actor: string) => string; 
  align?: 'left' | 'right';
}) {
  const catConfig = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.milestone;
  
  return (
    <div className={`group inline-block w-full max-w-md p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 ${
      align === 'right' ? 'md:ml-auto' : align === 'left' ? 'md:mr-auto' : ''
    }`}>
      
      <div className={`flex items-center gap-3 mb-3 ${align === 'right' ? 'md:justify-end' : 'md:justify-start'}`}>
        <span className="text-2xl">{event.icon}</span>
        <span 
          className="text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full border"
          style={{ 
            backgroundColor: `${catConfig.color}15`, 
            color: catConfig.color,
            borderColor: `${catConfig.color}30`,
          }}
        >
          {catConfig.label}
        </span>
      </div>

      <h3 className="text-xl font-medium text-[var(--color-text)] mb-2">
        {event.titleThai}
      </h3>
      
      <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-4">
        {event.description}
      </p>

      {event.image && (
        <div className="relative mt-4 overflow-hidden rounded-xl bg-black/50 aspect-video">
          <Image 
            src={event.image} 
            alt={event.titleThai} 
            fill
            sizes="(max-width: 768px) 90vw, 40vw"
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" 
          />
        </div>
      )}

      <div className={`mt-4 flex items-center gap-2 ${align === 'right' ? 'md:justify-end' : 'md:justify-start'}`}>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getActorGradient(event.actor)}`} />
        <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">
          {event.actor === 'both' ? 'Namtan × Film' : event.actor === 'namtan' ? 'Namtan' : 'Film'}
        </span>
      </div>
    </div>
  );
}

