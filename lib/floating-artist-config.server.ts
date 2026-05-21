import { supabase } from '@/lib/supabase';
import {
  DEFAULT_FLOATING_ARTIST_CONFIG,
  normalizeFloatingArtistSelectorConfig,
  type FloatingArtistSelectorConfig,
} from '@/lib/floating-artist-config';

export async function fetchFloatingArtistSelectorConfig(): Promise<FloatingArtistSelectorConfig> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'floatingArtistSelector')
    .maybeSingle();

  if (error || data?.value === undefined || data?.value === null) {
    return DEFAULT_FLOATING_ARTIST_CONFIG;
  }

  return normalizeFloatingArtistSelectorConfig(data.value);
}
