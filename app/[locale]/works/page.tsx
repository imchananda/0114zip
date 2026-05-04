'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Search, Film, Tv, Star, Megaphone, Trophy, ArrowLeft, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Mascot } from '@/components/mascot/Mascot';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  content_type: string;
  title: string;
  title_thai?: string;
  year: number;
  actors: string[];
  description?: string;
  image?: string;
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon | null; label: string; labelTh: string }> = {
  all:      { icon: null,      label: 'Full Archive', labelTh: 'ทั้งหมด' },
  series:   { icon: Tv,        label: 'Series',       labelTh: 'ซีรีส์' },
  variety:  { icon: Film,      label: 'Variety',      labelTh: 'วาไรตี้' },
  event:    { icon: Megaphone, label: 'Events',       labelTh: 'อีเวนต์' },
  magazine: { icon: Star,      label: 'Fashion',      labelTh: 'นิตยสาร' },
  award:    { icon: Trophy,    label: 'Awards',       labelTh: 'รางวัล' },
};

const ACTOR_OPTIONS = [
  { value: 'all',    label: 'All Artists', labelTh: 'ทุกคน' },
  { value: 'both',   label: 'Together',    labelTh: 'ผลงานคู่' },
  { value: 'namtan', label: 'Namtan',      labelTh: 'น้ำตาล' },
  { value: 'film',   label: 'Film',        labelTh: 'ฟิล์ม' },
];

type SortKey = 'year_desc' | 'year_asc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortKey; label: string; labelTh: string }[] = [
  { value: 'year_desc', label: 'Newest First', labelTh: 'ล่าสุด → เก่าสุด' },
  { value: 'year_asc',  label: 'Oldest First', labelTh: 'เก่าสุด → ล่าสุด' },
  { value: 'name_asc',  label: 'Name A-Z',     labelTh: 'ชื่อ A → Z' },
  { value: 'name_desc', label: 'Name Z-A',     labelTh: 'ชื่อ Z → A' },
];

export default function WorksPage() {
  const locale = useLocale();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [actor, setActor] = useState('all');
  const [sort, setSort] = useState<SortKey>('year_desc');
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  async function fetchData(pageNum: number, reset = false) {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'all') params.append('type', type);
      if (actor !== 'all') params.append('actor', actor);
      if (debouncedSearch) params.append('search', debouncedSearch);
      params.append('page', String(pageNum));
      params.append('limit', '24');

      const res = await fetch(`/api/works?${params.toString()}`);
      const json = await res.json();

      if (json.data && Array.isArray(json.data)) {
        setItems(prev => reset ? json.data : [...prev, ...json.data]);
        setTotalPages(json.totalPages ?? 1);
        setTotal(json.total ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPage(1);
      setItems([]);
      void fetchData(1, true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [type, actor, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };

  const sortedItems = useCallback(() => {
    const sorted = [...items];
    switch (sort) {
      case 'year_desc': sorted.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)); break;
      case 'year_asc':  sorted.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title)); break;
      case 'name_asc':  sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name_desc': sorted.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    return sorted;
  }, [items, sort]);

  const displayItems = sortedItems();
  const hasActiveFilters = type !== 'all' || actor !== 'all' || debouncedSearch !== '';

  return (
    <main className="min-h-screen pt-32 pb-24 bg-[var(--color-bg)] transition-colors duration-500">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            {locale === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-12">
            <div>
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Portfolio</p>
              <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light">
                Complete <span className="nf-gradient-text italic">Archive</span>
              </h1>
            </div>
            <p className="text-muted max-w-sm text-sm leading-relaxed font-body opacity-80">
              {locale === 'th' 
                ? 'รวบรวมผลงานการแสดง ซีรีส์ วาไรตี้ และอีเวนต์ทั้งหมดของน้ำตาลและฟิล์มไว้ในที่เดียว' 
                : 'A curated collection of all performances, series, variety shows, and events featuring Namtan and Film.'}
            </p>
          </div>
        </header>

        {/* Controls Bar */}
        <div className="sticky top-20 z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl py-6 mb-12 border-b border-theme/20">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            
            {/* Search */}
            <div className="w-full lg:max-w-md relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder={locale === 'th' ? 'ค้นหาชื่อผลงาน...' : 'Search archive...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-theme/60 rounded-full py-3.5 pl-12 pr-6 text-primary placeholder-muted/50 focus:outline-none focus:border-accent/40 focus:shadow-lg transition-all text-sm font-body"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
               {/* Actor Filter */}
               <div className="flex p-1 bg-surface border border-theme/60 rounded-full shadow-sm">
                  {ACTOR_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setActor(opt.value)}
                      className={cn(
                        "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                        actor === opt.value ? "bg-primary text-deep-dark shadow-md" : "text-muted hover:text-primary"
                      )}
                    >
                      {locale === 'th' ? opt.labelTh : opt.label}
                    </button>
                  ))}
               </div>

               {/* Sort Toggle */}
               <div className="relative group/sort">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="appearance-none bg-surface border border-theme/60 rounded-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-widest text-primary focus:outline-none focus:border-accent cursor-pointer shadow-sm"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{locale === 'th' ? opt.labelTh : opt.label}</option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
               </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full bg-surface border border-theme/60 text-xs font-bold uppercase tracking-[0.2em] text-primary"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {hasActiveFilters ? '•' : ''}
            </button>
          </div>

          {/* Mobile Filter Expandable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden mt-6 space-y-4"
              >
                <div className="p-6 bg-surface border border-theme/60 rounded-3xl space-y-6">
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3">Artist</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ACTOR_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => setActor(opt.value)} 
                            className={cn("px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase border transition-all", actor === opt.value ? "bg-primary text-deep-dark border-primary" : "bg-panel border-theme/40 text-muted")}>
                            {locale === 'th' ? opt.labelTh : opt.label}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3">Sort Order</p>
                      <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-full bg-panel border border-theme/40 rounded-xl p-3 text-xs font-bold uppercase text-primary">
                         {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{locale === 'th' ? opt.labelTh : opt.label}</option>)}
                      </select>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Quick Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-3 mb-12 pb-2">
           {Object.entries(TYPE_CONFIG).map(([key, config]) => (
             <button
                key={key}
                onClick={() => setType(key)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap border",
                  type === key 
                    ? "bg-deep-dark text-white border-deep-dark shadow-xl scale-105" 
                    : "bg-surface text-muted border-theme hover:border-accent hover:text-accent"
                )}
             >
                {config.icon && <config.icon className="w-3.5 h-3.5" />}
                {locale === 'th' ? config.labelTh : config.label}
             </button>
           ))}
        </div>

        {/* Content Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface rounded-[2rem] border border-theme/40 animate-pulse" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-32 bg-surface/50 border border-theme/40 rounded-[3rem]"
            >
              <Mascot state="sleeping" size={120} showCaption className="mx-auto mb-8 opacity-40" />
              <h3 className="text-2xl font-display text-primary font-light mb-3">No Results Found</h3>
              <p className="text-muted text-sm font-body opacity-60">Try adjusting your search or filters.</p>
              <button 
                onClick={() => { setType('all'); setActor('all'); setSearch(''); }}
                className="mt-10 px-8 py-3 bg-deep-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <AnimatePresence>
                {displayItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={`/works/${item.id}`} className="group block">
                      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-panel border border-theme/40 group-hover:border-accent/40 group-hover:shadow-2xl transition-all duration-500 mb-5">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.title} 
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted opacity-20">
                            <Film className="w-16 h-16" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-dark via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        
                        <div className="absolute top-4 right-4">
                           <div className="flex -space-x-1 shadow-sm">
                              {item.actors.includes('namtan') && <div className="w-2.5 h-2.5 rounded-full bg-namtan-primary border border-black/20" />}
                              {item.actors.includes('film') && <div className="w-2.5 h-2.5 rounded-full bg-film-primary border border-black/20" />}
                           </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[9px] font-bold text-accent uppercase tracking-[0.25em] mb-2 drop-shadow-sm">
                             {item.year} · {locale === 'th' ? TYPE_CONFIG[item.content_type]?.labelTh : TYPE_CONFIG[item.content_type]?.label}
                          </p>
                          <h3 className="text-white font-display text-lg md:text-xl leading-snug font-light line-clamp-2">
                             {locale === 'th' && item.title_thai ? item.title_thai : item.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Pagination / Load More */}
        {!loading && page < totalPages && (
          <div className="flex flex-col items-center justify-center mt-20 border-t border-theme/40 pt-12">
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-8">
               Viewing {items.length} of {total} pieces
            </p>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-12 py-4 bg-surface border border-theme hover:border-accent hover:shadow-lg disabled:opacity-50 text-primary rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-4 group"
            >
              {loadingMore ? (
                <span className="animate-pulse">Loading Archive...</span>
              ) : (
                <>
                  <span>Load More</span>
                  <span className="group-hover:translate-y-1 transition-transform">↓</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
