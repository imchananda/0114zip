'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Film, Tv, Star, Megaphone, Trophy, ArrowLeft, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Mascot } from '@/components/mascot/Mascot';

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

const TYPE_CONFIG: Record<string, { icon: typeof Tv | null; label: string; labelTh: string }> = {
  all:      { icon: null,     label: 'All',       labelTh: 'ทั้งหมด' },
  series:   { icon: Tv,       label: 'Series',    labelTh: 'ซีรีส์' },
  variety:  { icon: Film,     label: 'Variety',   labelTh: 'วาไรตี้' },
  event:    { icon: Megaphone, label: 'Events',   labelTh: 'อีเวนต์' },
  magazine: { icon: Star,     label: 'Magazines', labelTh: 'นิตยสาร' },
  award:    { icon: Trophy,   label: 'Awards',    labelTh: 'รางวัล' },
};

const ACTOR_OPTIONS = [
  { value: 'all',    label: 'ทุกคน (All)',          labelEn: 'All Artists' },
  { value: 'both',   label: 'คู่ (Namtan × Film)',  labelEn: 'Together' },
  { value: 'namtan', label: 'น้ำตาล (Namtan)',      labelEn: 'Namtan' },
  { value: 'film',   label: 'ฟิล์ม (Film)',         labelEn: 'Film' },
];

type SortKey = 'year_desc' | 'year_asc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortKey; label: string; labelEn: string }[] = [
  { value: 'year_desc', label: 'ปีล่าสุด → เก่าสุด', labelEn: 'Year: Newest' },
  { value: 'year_asc',  label: 'ปีเก่าสุด → ล่าสุด', labelEn: 'Year: Oldest' },
  { value: 'name_asc',  label: 'ชื่อ A → Z',        labelEn: 'Name: A → Z' },
  { value: 'name_desc', label: 'ชื่อ Z → A',        labelEn: 'Name: Z → A' },
];

export default function WorksPage() {
  const t = useTranslations();
  const language = useLocale();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [actor, setActor] = useState('all');
  const [sort, setSort] = useState<SortKey>('year_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchData(1, true);
  }, [type, actor, debouncedSearch]);

  const fetchData = async (pageNum: number, reset = false) => {
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
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, false);
  };

  // Client-side sort
  const sortedItems = useCallback(() => {
    const sorted = [...items];
    switch (sort) {
      case 'year_desc':
        sorted.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
        break;
      case 'year_asc':
        sorted.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
        break;
      case 'name_asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return sorted;
  }, [items, sort]);

  const displayItems = sortedItems();

  const getActorColor = (actorsList: string[]) => {
    if (actorsList.includes('namtan') && actorsList.includes('film')) {
      return 'bg-amber-400 text-black';
    }
    if (actorsList.includes('namtan')) return 'bg-[#69BCDC] text-black';
    if (actorsList.includes('film')) return 'bg-[#B1D182] text-black';
    return 'bg-white/20 text-white';
  };

  const getActorLabel = (actorsList: string[]) => {
    if (actorsList.includes('namtan') && actorsList.includes('film')) return 'น้ำตาล-ฟิล์ม';
    if (actorsList.includes('namtan')) return 'น้ำตาล';
    if (actorsList.includes('film')) return 'ฟิล์ม';
    return 'None';
  };

  const hasActiveFilters = type !== 'all' || actor !== 'all' || debouncedSearch !== '';

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#141413] to-[#30302e] border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[#87867f] hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </Link>
          
          <h1 className={`text-4xl md:text-5xl font-normal font-display text-white mb-4 ${language === 'th' ? 'font-thai' : ''}`}>
            Explore <span className="bg-gradient-to-r from-namtan-primary to-[#fbdf74] bg-clip-text text-transparent">Works</span>
          </h1>
          <p className="text-[#87867f] max-w-2xl">
            {language === 'th' 
              ? 'ค้นพบและย้อนดูผลงานทั้งหมดของน้ำตาลและฟิล์ม ทั้งผลงานคู่และเดี่ยว ไม่ว่าจะเป็นซีรีส์ รายการวาไรตี้ หรืองานอีเวนต์' 
              : 'Discover and look back at all works by Namtan and Film, both together and individual, including series, variety shows, and events.'}
          </p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#87867f]" />
            <input 
              type="text" 
              placeholder={language === 'th' ? 'ค้นหาชื่อผลงาน...' : 'Search titles...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-namtan-primary/60 transition-colors"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-namtan-primary/10 border-namtan-primary/30 text-namtan-primary'
                : 'bg-black/40 border-white/10 text-neutral-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            ตัวกรอง {hasActiveFilters ? '●' : ''}
          </button>
        </div>

        {/* Filter Row */}
        <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-4 mb-8`}>
          {/* Type Filter */}
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-namtan-primary/60 appearance-none cursor-pointer text-sm"
          >
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key} className="bg-[#141413]">
                {language === 'th' ? config.labelTh : config.label}
              </option>
            ))}
          </select>

          {/* Actor Filter */}
          <select 
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-namtan-primary/60 appearance-none cursor-pointer text-sm"
          >
            {ACTOR_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#141413]">
                {language === 'th' ? opt.label : opt.labelEn}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-namtan-primary/60 appearance-none cursor-pointer text-sm"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#141413]">
                {language === 'th' ? opt.label : opt.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Type Toggles (Desktop only) */}
        <div className="hidden md:flex flex-wrap gap-3 mb-6">
          {Object.entries(TYPE_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const active = type === key;
            return (
              <button
                key={key}
                onClick={() => setType(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all
                  ${active 
                    ? 'bg-white text-[#141413] font-medium shadow-lg shadow-white/10' 
                    : 'bg-white/5 text-[#87867f] hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {language === 'th' ? config.labelTh : config.label}
              </button>
            );
          })}
        </div>

        {/* Result Count + Sort indicator */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6 text-sm"
          >
            <p className="text-[#87867f]">
              {language === 'th' 
                ? `พบ ${total} ผลงาน`
                : `${total} result${total !== 1 ? 's' : ''} found`
              }
              {hasActiveFilters && (
                <button 
                  onClick={() => { setType('all'); setActor('all'); setSearch(''); }}
                  className="ml-3 text-namtan-primary hover:underline text-xs"
                >
                  {language === 'th' ? 'ล้างตัวกรอง' : 'Clear filters'}
                </button>
              )}
            </p>
            <div className="hidden sm:flex items-center gap-1.5 text-[#87867f]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="text-xs">
                {SORT_OPTIONS.find(s => s.value === sort)?.[language === 'th' ? 'label' : 'labelEn']}
              </span>
            </div>
          </motion.div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[3/4] bg-[#141413]/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-3xl"
          >
            <Mascot state="sleeping" size={100} showCaption className="mx-auto mb-6" />
            <h3 className="text-xl text-white mb-2 font-thai">
              {language === 'th' ? 'ไม่พบผลงาน' : 'No results found'}
            </h3>
            <p className="text-[#87867f] text-sm max-w-sm mx-auto">
              {language === 'th' 
                ? 'ลองปรับตัวกรองใหม่ หรือค้นหาด้วยคำค้นอื่น' 
                : 'Try adjusting your filters or search term.'}
            </p>
            <button 
              onClick={() => { setType('all'); setActor('all'); setSearch(''); }}
              className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full text-sm transition-colors"
            >
              {language === 'th' ? 'ล้างตัวกรองทั้งหมด' : 'Clear all filters'}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {displayItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/works/${item.id}`} className="group block h-full">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#30302e] mb-4 border border-white/5 group-hover:border-white/20 transition-colors">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#5e5d59] p-6 text-center">
                          <Film className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        <div className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getActorColor(item.actors)}`}>
                          {getActorLabel(item.actors)}
                        </div>
                      </div>

                      {/* Bottom Info inside image */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 text-xs text-namtan-primary font-medium tracking-widest uppercase mb-1">
                          {language === 'th' 
                            ? TYPE_CONFIG[item.content_type]?.labelTh || item.content_type
                            : item.content_type
                          } • {item.year}
                        </div>
                        <h3 className={`text-white font-medium text-lg leading-snug line-clamp-2 ${language === 'th' ? 'font-thai' : ''}`}>
                          {language === 'th' && item.title_thai ? item.title_thai : item.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loadingMore ? (
                <span className="animate-pulse">{language === 'th' ? 'กำลังโหลด...' : 'Loading...'}</span>
              ) : (
                <>
                  {language === 'th' ? `โหลดเพิ่ม (${items.length}/${total})` : `Load more (${items.length} of ${total})`}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
