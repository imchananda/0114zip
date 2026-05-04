'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Clock, CalendarDays, Archive } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface ScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  event_type: 'event' | 'show' | 'concert' | 'fanmeet' | 'live' | 'release';
  date: string; // YYYY-MM-DD HH:mm
  venue?: string;
  actors: string[];
  link?: string;
  description?: string;
}

const TYPE_STYLES: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  event:    { icon: Calendar,  color: 'var(--namtan-teal)', label: 'Event' },
  show:     { icon: Calendar,  color: '#AB47BC', label: 'Show' },
  concert:  { icon: Calendar,  color: '#EF5350', label: 'Concert' },
  fanmeet:  { icon: Calendar,  color: 'var(--film-gold)', label: 'Fan Meet' },
  live:     { icon: Calendar,  color: '#66BB6A', label: 'Live' },
  release:  { icon: Calendar,  color: '#FF7043', label: 'Release' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return { day: '-', month: '-', year: '-', time: '' };
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const time = dateStr.includes(' ') ? dateStr.split(' ')[1] : '';
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: months[d.getMonth()],
      year: d.getFullYear(),
      time: time
    };
  } catch {
    return { day: '-', month: '-', year: '-', time: '' };
  }
}

type Filter = 'all' | 'upcoming' | 'past';

export default function SchedulePage() {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllEvents(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const events = useMemo(() => {
    const filtered = allEvents.filter(e => {
      const d = new Date(e.date.replace(' ', 'T'));
      if (filter === 'upcoming') return d >= now;
      if (filter === 'past') return d < now;
      return true;
    });
    
    // Sort: upcoming = ascending, past = descending
    return filtered.sort((a, b) => {
      const da = new Date(a.date.replace(' ', 'T')).getTime();
      const db = new Date(b.date.replace(' ', 'T')).getTime();
      return filter === 'upcoming' ? da - db : db - da;
    });
  }, [allEvents, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const upcomingCount = allEvents.filter((e) => new Date(e.date.replace(' ', 'T')) >= now).length;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-4xl">
        
        {/* Header Section */}
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-10">
            <div>
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Official Itinerary</p>
              <h1 className="text-4xl md:text-6xl font-display text-primary leading-tight font-light">
                Engagement <span className="nf-gradient-text italic">Schedule</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-surface px-6 py-3 rounded-2xl border border-theme/60 shadow-sm">
               <CalendarDays className="w-5 h-5 text-accent" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {upcomingCount} Upcoming Events
               </span>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-12">
           {[
             { id: 'upcoming' as Filter, label: 'Upcoming', icon: CalendarDays },
             { id: 'past' as Filter, label: 'Archive', icon: Archive },
             { id: 'all' as Filter, label: 'All', icon: Calendar },
           ].map(opt => (
             <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border",
                  filter === opt.id 
                    ? "bg-deep-dark text-white border-deep-dark shadow-xl" 
                    : "bg-surface text-muted border-theme hover:border-accent hover:text-accent"
                )}
             >
                <opt.icon className="w-3.5 h-3.5" />
                {opt.label}
             </button>
           ))}
        </div>

        {/* List Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-surface rounded-3xl border border-theme/40 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-32 bg-surface/50 border border-theme/40 rounded-[2.5rem] opacity-40">
              <Calendar className="w-12 h-12 mx-auto mb-6 grayscale" />
              <p className="text-sm font-bold uppercase tracking-widest">No scheduled events found</p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {events.map((event, i) => {
                  const d = formatDate(event.date);
                  const style = TYPE_STYLES[event.event_type] || { icon: Calendar, color: 'var(--namtan-teal)', label: event.event_type };
                  const isPast = new Date(event.date.replace(' ', 'T')) < now;

                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                      className={cn(
                        "group bg-surface border border-theme/60 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row",
                        isPast && "opacity-60 grayscale-[0.3]"
                      )}
                    >
                      {/* Date Block */}
                      <div className="w-full md:w-32 flex-shrink-0 flex md:flex-col items-center justify-center py-6 px-8 md:px-0 border-b md:border-b-0 md:border-r border-theme/40 bg-panel/30">
                        <div className="text-center">
                           <span className="text-3xl font-display font-light text-primary tabular-nums block">{d.day}</span>
                           <span className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase mt-1 block">{d.month}</span>
                           <span className="text-[10px] font-bold tracking-widest text-muted/30 mt-1 block hidden md:block">{d.year}</span>
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="flex-1 p-8 min-w-0 relative">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                           <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-theme/60" style={{ background: `${style.color}10`, color: style.color }}>
                              {style.label}
                           </span>
                           <div className="flex -space-x-1">
                              {event.actors.includes('namtan') && <div className="w-2.5 h-2.5 rounded-full bg-namtan-primary border border-surface shadow-sm" />}
                              {event.actors.includes('film') && <div className="w-2.5 h-2.5 rounded-full bg-film-primary border border-surface shadow-sm" />}
                           </div>
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted/40">
                              {event.actors.includes('both') ? 'Together' : event.actors.join(' / ')}
                           </span>
                           {isPast && <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-panel text-muted/50 border border-theme/40">Completed</span>}
                        </div>

                        <h3 className="text-xl md:text-2xl font-display text-primary leading-tight font-light mb-6 group-hover:text-accent transition-colors">
                           {event.title_thai || event.title}
                        </h3>

                        <div className="flex flex-wrap gap-8 text-[10px] font-bold uppercase tracking-[0.15em] text-muted/60">
                           {d.time && <div className="flex items-center gap-3"><Clock className="w-3.5 h-3.5" /> {d.time}</div>}
                           {event.venue && <div className="flex items-center gap-3"><MapPin className="w-3.5 h-3.5" /> {event.venue}</div>}
                        </div>

                        {event.description && (
                          <p className="mt-6 text-sm text-muted leading-relaxed font-body line-clamp-2 italic opacity-80 pl-4 border-l-2 border-theme">
                            {event.description}
                          </p>
                        )}

                        {event.link && !isPast && (
                          <div className="mt-8">
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] px-8 py-3 rounded-full bg-deep-dark text-white hover:bg-accent hover:text-deep-dark transition-all duration-300 shadow-md"
                            >
                              {event.link.includes('ticket') ? 'Get Tickets' : 'View Details'}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <Calendar className="w-5 h-5 text-accent" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
