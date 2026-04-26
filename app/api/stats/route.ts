import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { timelineEvents } from '@/data/timeline';

type WorkRow = { year: number | null; content_type: string };
type WorkTypeKey = 'series' | 'variety' | 'event' | 'magazine';
type WorksAggRow = {
  year: number;
  total: number;
  series: number;
  variety: number;
  event: number;
  magazine: number;
};
type AwardsAggRow = { year: number; count: number; namtan: number; film: number; both: number };

function isWorkTypeKey(value: string): value is WorkTypeKey {
  return value === 'series' || value === 'variety' || value === 'event' || value === 'magazine';
}

export async function GET() {
  try {
    // 1. Fetch all visible content items
    const { data: works, error } = await supabase
      .from('content_items')
      .select('year, content_type')
      .eq('visible', true);

    if (error) throw error;

    // Aggregate Works by Year (Total works grouped by year)
    // Structure needed: { year: 2021, series: 1, variety: 2, total: 3 }
    const worksAggr: Record<number, WorksAggRow> = {};
    (works as WorkRow[])?.forEach(w => {
      const y = w.year || 2020;
      if (!worksAggr[y]) worksAggr[y] = { year: y, total: 0, series: 0, variety: 0, event: 0, magazine: 0 };
      worksAggr[y].total += 1;
      const type = w.content_type;
      if (isWorkTypeKey(type)) {
        worksAggr[y][type] += 1;
      }
    });

    const worksData = Object.values(worksAggr).sort((a, b) => a.year - b.year);

    // Aggregate Awards by Year (from timeline.ts)
    // Category: 'award'
    const awardsAggr: Record<number, AwardsAggRow> = {};
    timelineEvents.filter(e => e.category === 'award').forEach(a => {
      const y = a.year;
      if (!awardsAggr[y]) awardsAggr[y] = { year: y, count: 0, namtan: 0, film: 0, both: 0 };
      awardsAggr[y].count += 1;
      awardsAggr[y][a.actor] += 1;
    });

    const awardsData = Object.values(awardsAggr).sort((a, b) => a.year - b.year);

    return NextResponse.json({
      works: worksData,
      awards: awardsData
    });
  } catch (error: unknown) {
    console.error('Stats API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
