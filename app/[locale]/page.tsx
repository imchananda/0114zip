import { fetchHomeData } from '@/lib/homepage-data';
import { HomePageClient } from './HomePageClient';

export default async function HomePage() {
  const data = await fetchHomeData();
  return <HomePageClient data={data} />;
}
