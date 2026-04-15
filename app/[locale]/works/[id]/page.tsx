import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PlayCircle, ExternalLink, Calendar, Users, Info } from 'lucide-react';
import { getAdminClient } from '@/lib/supabase';

// Note: Using getAdminClient() just for server-side fetching public config
// We can use createClient if needed, but since it's a server component and public read is allowed,
// we just fetch directly.
export const revalidate = 60; // Revalidate every 60 seconds

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

  // Parse links if they exist
  let links: any[] = [];
  try {
    if (item.links) {
      links = typeof item.links === 'string' ? JSON.parse(item.links) : item.links;
    }
  } catch (e) {}

  // Check if there is a YouTube trailer link
  const trailerLink = links.find((l: any) => l.platform.toLowerCase() === 'youtube' || l.url.includes('youtube.com/watch'));
  const getYouTubeId = (url: string) => {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const trailerId = trailerLink ? getYouTubeId(trailerLink.url) : null;

  return (
    <main className="min-h-screen bg-neutral-950 pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.title} 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"></div>
        
        <div className="absolute top-0 left-0 right-0 p-6 z-20">
          <Link href="/works" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Works
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Poster (Desktop Only) */}
            <div className="hidden md:block relative w-64 shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-neutral-900 aspect-[3/4]">
              {item.image && (
                <Image src={item.image} alt={item.title} fill sizes="256px" className="object-cover" />
              )}
            </div>

            {/* Title & Meta */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-namtan-primary/20 text-namtan-primary rounded-full text-xs font-bold uppercase tracking-wider border border-namtan-primary/30">
                  {item.content_type}
                </span>
                <span className="flex items-center gap-1 text-white/70 text-sm font-medium">
                  <Calendar className="w-4 h-4" /> {item.year}
                </span>
                {item.actors?.length > 0 && (
                  <span className="flex items-center gap-1 text-white/70 text-sm font-medium ml-2">
                    <Users className="w-4 h-4" /> {item.actors.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(' & ')}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
                {item.title}
              </h1>
              {item.title_thai && (
                <h2 className="text-2xl text-white/60 font-thai mb-6">
                  {item.title_thai}
                </h2>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                {trailerLink && (
                  <a href="#trailer" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors">
                    <PlayCircle className="w-5 h-5" />
                    Watch Trailer
                  </a>
                )}
                {links.filter((l: any) => l.platform.toLowerCase() !== 'youtube' && !l.url.includes('youtube.com/watch')).map((link: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors backdrop-blur-md"
                  >
                    Watch on {link.platform}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Description */}
          <section>
            <h3 className="text-2xl font-medium text-white mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-namtan-primary" />
              Synopsis
            </h3>
            <div className="text-neutral-300 text-lg leading-relaxed font-thai whitespace-pre-wrap bg-white/5 p-8 rounded-3xl border border-white/5">
              {item.description ? item.description : 'No description available for this content.'}
            </div>
          </section>

          {/* Trailer Embed */}
          {trailerId && (
            <section id="trailer" className="pt-8 scroll-mt-24">
              <h3 className="text-2xl font-medium text-white mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-[#FF0000]" />
                Official Trailer
              </h3>
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${trailerId}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">Details</h3>
            
            <dl className="space-y-6">
              {item.role && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Role</dt>
                  <dd className="text-white font-medium">{item.role}</dd>
                </div>
              )}
              
              {item.event_type && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Event Type</dt>
                  <dd className="text-white font-medium">{item.event_type}</dd>
                </div>
              )}
              
              {item.venue && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Venue</dt>
                  <dd className="text-white font-medium">{item.venue}</dd>
                </div>
              )}
              
              {item.date && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Date</dt>
                  <dd className="text-white font-medium">{item.date}</dd>
                </div>
              )}
              
              {item.magazine_name && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Magazine</dt>
                  <dd className="text-white font-medium">{item.magazine_name} {item.issue && `(Issue: ${item.issue})`}</dd>
                </div>
              )}
              
              {item.award_name && (
                <div>
                  <dt className="text-neutral-500 text-sm mb-1 uppercase tracking-wider">Award</dt>
                  <dd className="text-white font-medium">{item.award_name}</dd>
                </div>
              )}
              
              {item.link && (
                <div className="pt-4 mt-4 border-t border-white/10">
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-namtan-primary hover:underline flex items-center gap-1 text-sm font-medium">
                    Visit Official Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
