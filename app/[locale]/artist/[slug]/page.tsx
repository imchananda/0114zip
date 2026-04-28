import { notFound } from 'next/navigation';
import { ViewState } from '@/types';
import { supabase } from '@/lib/supabase';
import { ArtistTabs } from '@/components/artist/ArtistTabs';

const VALID_SLUGS: ViewState[] = ['namtan', 'film', 'both', 'lunar'];

export default async function ArtistPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}) {
  const { slug: slugParam } = await params;
  const slug = slugParam as ViewState;
  
  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  // Fetch content server-side from Supabase
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false }) as { data: any[] | null };

  const allContent: any[] = data?.map(d => ({
    id: d.id,
    title: d.title,
    titleThai: d.title_thai,
    year: d.year,
    image: d.image || '/images/placeholders/content.jpg',
    actors: d.actors || [],
    contentType: d.content_type,
    description: d.description,
    link: d.link,
    role: d.role,
    links: d.links
  })) || [];

  return (
    <ArtistTabs 
      slug={slug} 
      allContent={allContent} 
    />
  );
}
