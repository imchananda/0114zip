import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 300; // Cache for 5 minutes

interface BrandCollaborationRow {
  start_date: string | null;
}

// GET /api/brands?artist=namtan&year=2026
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const artist = searchParams.get('artist'); // 'namtan' | 'film' | 'both' | null
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : null;

  try {
    let query = supabase
      .from('brand_collaborations')
      .select('*')
      .eq('visible', true)
      .order('start_date', { ascending: false });

    if (artist && artist !== 'both') {
      query = query.contains('artists', [artist]);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let brands: BrandCollaborationRow[] = (data as BrandCollaborationRow[] | null) ?? [];

    if (year && Number.isFinite(year)) {
      brands = brands.filter((b) =>
        b.start_date && new Date(b.start_date).getFullYear() === year,
      );
    }

    // Distinct years for filter pills (from full unfiltered set)
    const yearsSet = new Set<number>();
    ((data as BrandCollaborationRow[] | null) ?? []).forEach((b) => {
      if (b.start_date) yearsSet.add(new Date(b.start_date).getFullYear());
    });
    const years = Array.from(yearsSet).sort((a, b) => b - a);

    return NextResponse.json({ brands, years });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
