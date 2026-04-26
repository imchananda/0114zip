'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { ArrowLeft, Clock, History, Star, Award, Tv, Megaphone, Milestone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { TimelineEvent } from '@/data/timeline';
import { cn } from '@/lib/utils';

type TimelineApiRow = Omit<TimelineEvent, 'titleThai'> & { title_thai?: string };

const CATEGORY_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string; labelTh: string }> = {
  all:       { label: 'All Events', icon: History, color: 'var(--primary)', labelTh: 'ทั้งหมด' },
  milestone: { label: 'Milestones', icon: Milestone, color: '#A78BFA', labelTh: 'เหตุการณ์สำคัญ' },
  work:      { label: 'Projects',   icon: Tv, color: 'var(--namtan-teal)', labelTh: 'ผลงาน' },
  award:     { label: 'Awards',     icon: Award, color: 'var(--film-gold)', labelTh: 'รางวัล' },
  event:     { label: 'Publicity',  icon: Megaphone, color: '#EF5350', labelTh: 'กิจกรรม' },
  debut:     { label: 'Debut',      icon: Star, color: '#66BB6A', labelTh: 'เดบิวต์' },
};

const ACTOR_FILTERS: { id: 'all' | 'both' | 'namtan' | 'film'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'both', label: 'Together' },
  { id: 'namtan', label: 'Namtan' },
  { id: 'film', label: 'Film' },
];

export default function TimelinePage() {
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [actorFilter, setActorFilter] = useState<'all' | 'namtan' | 'film' | 'both'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const yearRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/timeline')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllEvents(
            (data as TimelineApiRow[]).map((row) => ({
              ...row,
              titleThai: row.title_thai ?? '',
            }))
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoadingEvents(false));
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

  const grouped = useMemo(() => {
    return events.reduce((acc, ev) => {
      if (!acc[ev.year]) acc[ev.year] = [];
      acc[ev.year].push(ev);
      return acc;
    }, {} as Record<number, TimelineEvent[]>);
  }, [events]);

  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a); // Newest first for better magazine reading

  const effectiveActiveYear = activeYear ?? years[0] ?? null;

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
    Object.values(yearRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [events]);

  const scrollToYear = (year: number) => {
    const el = yearRefs.current[year];
    if (el) {
      const offset = 140;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveYear(year);
    }
  };

  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 rounded-full border-2 border-theme border-t-accent animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted animate-pulse">Building Timeline...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500 relative">
      <Header />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-12">
            <div>
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Historical Journey</p>
              <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light">
                Memorial <span className="nf-gradient-text italic">Chronicles</span>
              </h1>
            </div>
            <div className="flex flex-col gap-6 max-w-sm">
               <p className="text-muted text-sm leading-relaxed font-body opacity-80">
                  Tracing the significant milestones, works, and awards that define the legacy of Namtan and Film.
               </p>
               {/* Year Pills Navigation */}
               <div className="flex flex-wrap gap-2">
                  {years.map(y => (
                    <button key={y} onClick={() => scrollToYear(y)} 
                      className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300", 
                      effectiveActiveYear === y ? "bg-deep-dark text-white border-deep-dark shadow-md" : "bg-panel border-theme/40 text-muted hover:border-accent hover:text-accent")}>
                      {y}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </header>

        {/* Global Filters */}
        <div className="sticky top-20 z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl py-6 mb-16 border-b border-theme/20">
           <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
              <div className="flex p-1 bg-surface border border-theme/60 rounded-full shadow-sm">
                {ACTOR_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActorFilter(f.id)}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                      actorFilter === f.id ? "bg-primary text-deep-dark shadow-md" : "text-muted hover:text-primary"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                  const active = categoryFilter === key;
                  if (key === 'all') return null;
                  const count = events.filter(e => e.category === key).length;
                  if (count === 0 && !active) return null;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setCategoryFilter(active ? 'all' : key)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300",
                        active ? "bg-deep-dark text-white border-deep-dark shadow-lg" : "bg-surface text-muted border-theme hover:border-accent hover:text-accent"
                      )}
                    >
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Timeline Feed */}
        <div className="relative max-w-5xl mx-auto">
           {/* Center line (Desktop) */}
           <div className="absolute left-[30px] md:left-1/2 top-4 bottom-0 w-px bg-gradient-to-b from-theme via-theme to-transparent md:-translate-x-1/2 opacity-40" />

           <AnimatePresence mode="popLayout">
              {years.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 opacity-40">
                   <Clock className="w-16 h-16 mx-auto mb-6 grayscale" />
                   <p className="text-sm font-bold uppercase tracking-widest">No history found for these filters</p>
                </motion.div>
              ) : (
                years.map(year => (
                  <div key={year} className="mb-24 relative" ref={el => { yearRefs.current[year] = el; }} data-year={year}>
                    {/* Year Indicator */}
                    <div className="sticky top-44 z-20 mb-12 flex md:justify-center">
                       <span className="px-8 py-3 bg-deep-dark text-white rounded-full text-2xl font-display font-light tracking-[0.2em] shadow-2xl">
                          {year}
                       </span>
                    </div>

                    <div className="space-y-16">
                       {grouped[year].map((ev, i) => {
                         const isLeft = i % 2 === 0;
                         const config = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.milestone;
                         
                         return (
                           <motion.div
                              key={ev.id}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-100px" }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                              className={cn("relative flex items-center gap-12 md:gap-20", isLeft ? "md:flex-row" : "md:flex-row-reverse")}
                           >
                              {/* Connector Dot */}
                              <div className="absolute left-[30px] md:left-1/2 w-4 h-4 rounded-full border-4 border-[var(--color-bg)] bg-accent z-10 shadow-lg md:-translate-x-1/2" />

                              {/* Card Content */}
                              <div className={cn("flex-1 pl-16 md:pl-0", isLeft ? "md:text-right" : "md:text-left")}>
                                 <div className={cn("group bg-surface border border-theme/60 rounded-[2rem] p-8 md:p-10 hover:shadow-2xl hover:border-accent/40 transition-all duration-500 relative overflow-hidden inline-block w-full max-w-xl", isLeft ? "md:ml-auto" : "md:mr-auto")}>
                                    <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: config.color }} />
                                    
                                    <div className={cn("flex items-center gap-4 mb-6", isLeft ? "md:justify-end" : "md:justify-start")}>
                                       <div className="p-2.5 rounded-xl bg-panel border border-theme/40 text-muted grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                                          <config.icon className="w-5 h-5" />
                                       </div>
                                       <span className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full border border-theme/40" style={{ background: `${config.color}10`, color: config.color }}>
                                          {config.label}
                                       </span>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-display text-primary leading-tight font-light mb-4 group-hover:text-accent transition-colors">
                                       {ev.titleThai || ev.title}
                                    </h3>
                                    
                                    <p className="text-muted text-sm md:text-base leading-relaxed font-body opacity-80 mb-8">
                                       {ev.description}
                                    </p>

                                    {ev.image && (
                                       <div className="relative aspect-video rounded-2xl overflow-hidden bg-panel mb-8 border border-theme/40">
                                          <Image src={ev.image} alt="" fill className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-deep-dark/40 to-transparent" />
                                       </div>
                                    )}

                                    <div className={cn("flex items-center gap-3", isLeft ? "md:justify-end" : "md:justify-start")}>
                                       <div className="flex -space-x-1">
                                          {ev.actor === 'both' ? (
                                            <>
                                               <div className="w-2.5 h-2.5 rounded-full bg-namtan-teal border border-surface shadow-sm" />
                                               <div className="w-2.5 h-2.5 rounded-full bg-film-gold border border-surface shadow-sm" />
                                            </>
                                          ) : (
                                            <div className="w-2.5 h-2.5 rounded-full border border-surface shadow-sm" style={{ background: ev.actor === 'namtan' ? 'var(--namtan-teal)' : 'var(--film-gold)' }} />
                                          )}
                                       </div>
                                       <span className="text-[9px] font-bold uppercase tracking-widest text-muted/40">
                                          {ev.actor === 'both' ? 'Together' : ev.actor}
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              {/* Empty side for layout spacing */}
                              <div className="hidden md:block flex-1" />
                           </motion.div>
                         );
                       })}
                    </div>
                  </div>
                ))
              )}
           </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
