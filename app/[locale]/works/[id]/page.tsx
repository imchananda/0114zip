import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PlayCircle, ExternalLink, Calendar, Film } from 'lucide-react';
import { getAdminClient } from '@/lib/supabase';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';

export const revalidate = 60;

interface WorkLink {
  platform?: string;
  url?: string;
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  
  const { data: item, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .eq('visible', true)
    .single();

  if (error || !item) {
    notFound();
  }

  let links: WorkLink[] = [];
  try {
    if (item.links) {
      const parsed = typeof item.links === 'string' ? JSON.parse(item.links) : item.links;
      if (Array.isArray(parsed)) {
        links = parsed.filter((l): l is WorkLink => !!l && typeof l === 'object');
      }
    }
  } catch {}

  const trailerLink = links.find((l) => l.platform?.toLowerCase() === 'youtube' || l.url?.includes('youtube.com/watch'));
  const getYouTubeId = (url: string) => {
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const trailerId = trailerLink?.url ? getYouTubeId(trailerLink.url) : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      
      {/* Hero Header Section */}
      <div className="relative h-[65vh] md:h-[80vh] w-full overflow-hidden bg-panel">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.title} 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30 grayscale-[0.3]"
          />
        ) : (
          <div className="w-full h-full bg-panel flex items-center justify-center">
             <Film className="w-24 h-24 text-muted opacity-10" />
          </div>
        )}
        
        {/* Soft Magazine Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 z-10 w-full max-w-7xl mx-auto">
          <Link href="/works" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-10 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Archive
          </Link>

          <div className="flex flex-col md:flex-row gap-12 md:items-end">
            {/* Poster Card */}
            <div className="hidden md:block relative w-72 shrink-0 rounded-[2.5rem] overflow-hidden border border-theme shadow-2xl bg-surface aspect-[2/3] group hover:scale-[1.02] transition-transform duration-700">
              {item.image && (
                <Image src={item.image} alt={item.title} fill sizes="288px" className="object-cover group-hover:scale-110 transition-transform duration-1000" />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="px-4 py-1 bg-accent text-deep-dark rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                  {item.content_type}
                </span>
                <span className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-widest">
                  <Calendar className="w-4 h-4 opacity-40" /> {item.year}
                </span>
                <div className="flex -space-x-1 ml-4">
                  {item.actors?.includes('namtan') && <div className="w-3 h-3 rounded-full bg-namtan-primary border-2 border-[var(--color-bg)]" />}
                  {item.actors?.includes('film') && <div className="w-3 h-3 rounded-full bg-film-primary border-2 border-[var(--color-bg)]" />}
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light mb-4 max-w-4xl">
                {item.title}
              </h1>
              {item.title_thai && (
                <h2 className="text-2xl md:text-3xl text-muted font-thai font-light tracking-wide mb-10 opacity-70">
                  {item.title_thai}
                </h2>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-4">
                {trailerLink && (
                  <a href="#trailer" className="inline-flex items-center gap-3 bg-deep-dark text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-deep-dark transition-all duration-300 shadow-xl">
                    <PlayCircle className="w-4 h-4" />
                    Watch Trailer
                  </a>
                )}
                {links.filter((l) => l.platform?.toLowerCase() !== 'youtube' && !l.url?.includes('youtube.com/watch')).map((link, idx: number) => (
                  <a 
                    key={idx} 
                    href={link.url ?? '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-surface text-primary px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border border-theme hover:border-accent transition-all duration-300 shadow-sm"
                  >
                    View on {link.platform ?? 'Platform'}
                    <ExternalLink className="w-3 h-3 opacity-40" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-24 grid grid-cols-1 lg:grid-cols-3 gap-20">
        
        {/* Left Column: Description & Media */}
        <div className="lg:col-span-2 space-y-24">
          
          {/* Synopsis Section */}
          <section className="relative">
            <div className="absolute -left-12 top-0 w-1 h-full bg-gradient-to-b from-accent to-transparent opacity-20 hidden md:block" />
            <h3 className="text-overline text-accent font-bold mb-8 uppercase tracking-[0.4em]">Synopsis</h3>
            <div className="text-primary/90 text-lg md:text-xl leading-relaxed font-body whitespace-pre-wrap">
              {item.description || 'No detailed description recorded for this entry.'}
            </div>
          </section>

          {/* Trailer Section */}
          {trailerId && (
            <section id="trailer" className="scroll-mt-32">
              <h3 className="text-overline text-accent font-bold mb-8 uppercase tracking-[0.4em]">Official Video</h3>
              <div className="aspect-video w-full rounded-[3rem] overflow-hidden border border-theme shadow-2xl bg-deep-dark relative group">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${trailerId}?rel=0&showinfo=0`} 
                  title="Official Trailer" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                ></iframe>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Metadata Sidebar */}
        <aside className="space-y-12">
          <div className="bg-surface border border-theme/60 rounded-[2.5rem] p-10 shadow-sm sticky top-32">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-10 border-b border-theme/40 pb-4">
              Project Intelligence
            </h3>
            
            <div className="space-y-8">
              {[
                { label: 'Role / Character', value: item.role },
                { label: 'Platform / Channel', value: item.event_type },
                { label: 'Venue / Location', value: item.venue },
                { label: 'Release Date', value: item.date },
                { label: 'Magazine / Issue', value: item.magazine_name ? `${item.magazine_name} ${item.issue ? `(${item.issue})` : ''}` : null },
                { label: 'Award Category', value: item.award_name },
              ].map((row, i) => row.value && (
                <div key={i} className="group/meta">
                  <dt className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-2 opacity-50 group-hover/meta:opacity-100 transition-opacity">
                    {row.label}
                  </dt>
                  <dd className="text-primary text-base font-body font-medium">{row.value}</dd>
                </div>
              ))}
              
              {item.link && (
                <div className="pt-8 mt-8 border-t border-theme/40">
                  <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent hover:underline">
                    Access Official Resource <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}
