import { Series, Variety, Event, Magazine, Award, ContentItem, Platform, EventType, Work } from '@/types';
import { series as backupSeries } from '@/data/series';
import { variety as backupVariety } from '@/data/variety';
import { events as backupEvents } from '@/data/events';
import { magazines as backupMagazines } from '@/data/magazines';
import { awards as backupAwards } from '@/data/awards';
import { works as backupWorks } from '@/data/works';

// Google Sheet ID - public sheet, no API key required
const SHEET_ID = '1pV2bkFBwv-JZAyL3ehCnJaH9RH8vc5whtFH1CK4kctQ';

// Helper function to fetch data from public Google Sheet
async function fetchSheetData(sheetName: string): Promise<any[]> {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

    try {
        console.log(`[Google Sheets] Fetching sheet: ${sheetName}`);
        console.log(`[Google Sheets] URL: ${url}`);

        const response = await fetch(url, {
            cache: 'no-store', // Disable cache for debugging
            headers: {
                'Accept': 'application/json, text/plain, */*',
            }
        });

        console.log(`[Google Sheets] Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`[Google Sheets] HTTP error: ${response.status} ${response.statusText}`);
            return [];
        }

        const text = await response.text();
        console.log(`[Google Sheets] Response length: ${text.length} chars`);

        // Parse Google's JSONP response - use [\s\S]* to match newlines
        const jsonString = text.replace(/^[\s\S]*?google\.visualization\.Query\.setResponse\(/, '').replace(/\);[\s\S]*$/, '');
        const data = JSON.parse(jsonString);

        if (!data.table || !data.table.rows || data.table.rows.length === 0) {
            console.warn(`[Google Sheets] No data found in sheet "${sheetName}"`);
            return [];
        }

        // Get column headers - check if they're in col.label or in first row
        let headers: string[] = data.table.cols.map((col: any) => col.label);
        let dataRows = data.table.rows;

        console.log(`[Google Sheets] Sheet "${sheetName}": ${dataRows.length} rows, parsedNumHeaders: ${data.table.parsedNumHeaders}`);

        // If parsedNumHeaders is 0, headers are in the first row of data
        if (data.table.parsedNumHeaders === 0 && dataRows.length > 0) {
            const firstRow = dataRows[0];
            if (firstRow.c) {
                headers = firstRow.c.map((cell: any) => cell?.v ?? '');
            }
            dataRows = dataRows.slice(1); // Skip header row
        }

        console.log(`[Google Sheets] Headers: ${headers.join(', ')}`);

        // Transform rows to objects
        const rows = dataRows.map((row: any) => {
            const obj: any = {};
            if (row.c) {
                row.c.forEach((cell: any, index: number) => {
                    const header = headers[index];
                    if (header) {
                        obj[header] = cell?.v ?? null;
                    }
                });
            }
            return obj;
        });

        console.log(`[Google Sheets] Successfully parsed ${rows.length} data rows from "${sheetName}"`);
        return rows;
    } catch (error) {
        console.error(`[Google Sheets] Error fetching sheet "${sheetName}":`, error);
        return [];
    }
}


// Helper function to parse actors string
function parseActors(actorsStr: string | null): ('namtan' | 'film')[] {
    if (!actorsStr) return [];
    return actorsStr
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter((s: string): s is 'namtan' | 'film' => s === 'namtan' || s === 'film');
}

// Helper function to process image URL
function processImageUrl(imageUrl: string | null): string {
    if (!imageUrl) return '';

    if (imageUrl.includes('drive.google.com')) {
        const match = imageUrl.match(/[-\w]{25,}/);
        if (match) {
            return `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1000`;
        }
    } else if (imageUrl.includes('dropbox.com')) {
        if (imageUrl.includes('dl=0')) {
            return imageUrl.replace('dl=0', 'raw=1');
        } else if (!imageUrl.includes('raw=1')) {
            const separator = imageUrl.includes('?') ? '&' : '?';
            return `${imageUrl}${separator}raw=1`;
        }
    }

    return imageUrl;
}

// Helper to parse links from row
function parseLinks(row: any): { platform: Platform; url: string }[] {
    const platforms: Platform[] = ['youtube', 'netflix', 'wetv', 'iqiyi', 'viu', 'gmm', 'other'];
    const links: { platform: Platform; url: string }[] = [];

    for (const p of platforms) {
        const url = row[`link_${p}`];
        if (url && typeof url === 'string' && url.startsWith('http')) {
            links.push({ platform: p, url });
        }
    }

    return links;
}

// ==================== SERIES ====================
export async function getSeries(): Promise<Series[]> {
    try {
        const rows = await fetchSheetData('Series');

        if (rows.length === 0) {
            console.warn('No data in Series sheet, using backup.');
            return backupSeries;
        }

        const processedIds = new Set();

        const data: Series[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => ({
                contentType: 'series' as const,
                id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                title: row.title || '',
                titleThai: row.title_thai || undefined,
                year: parseInt(row.year) || 0,
                actors: parseActors(row.actors),
                role: row.role || undefined,
                description: row.description || undefined,
                image: processImageUrl(row.image_url),
                links: parseLinks(row).length > 0 ? parseLinks(row) : undefined,
            }))
            .filter((item: Series) => {
                if (processedIds.has(item.id)) return false;
                processedIds.add(item.id);
                return true;
            });

        return data.length > 0 ? data : backupSeries;
    } catch (error) {
        console.error('Error fetching Series:', error);
        return backupSeries;
    }
}

// ==================== VARIETY ====================
export async function getVariety(): Promise<Variety[]> {
    try {
        const rows = await fetchSheetData('Variety');

        if (rows.length === 0) {
            console.warn('No data in Variety sheet, using backup.');
            return backupVariety;
        }

        const processedIds = new Set();

        const data: Variety[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => ({
                contentType: 'variety' as const,
                id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                title: row.title || '',
                titleThai: row.title_thai || undefined,
                year: parseInt(row.year) || 0,
                actors: parseActors(row.actors),
                image: processImageUrl(row.image_url),
                link: row.link || parseLinks(row)[0]?.url || undefined,
            }))
            .filter((item: Variety) => {
                if (processedIds.has(item.id)) return false;
                processedIds.add(item.id);
                return true;
            });

        return data.length > 0 ? data : backupVariety;
    } catch (error) {
        console.error('Error fetching Variety:', error);
        return backupVariety;
    }
}

// ==================== EVENTS ====================
export async function getEvents(): Promise<Event[]> {
    try {
        const rows = await fetchSheetData('Event');

        if (rows.length === 0) {
            console.warn('No data in Event sheet, using backup.');
            return backupEvents;
        }

        const processedIds = new Set();

        const data: Event[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => ({
                contentType: 'event' as const,
                id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                title: row.title || '',
                titleThai: row.title_thai || undefined,
                date: row.date || undefined,
                year: parseInt(row.year) || 0,
                actors: parseActors(row.actors),
                eventType: (row.event_type || 'other') as EventType,
                venue: row.venue || undefined,
                description: row.description || undefined,
                image: processImageUrl(row.image_url),
                link: row.link || parseLinks(row)[0]?.url || undefined,
            }))
            .filter((item: Event) => {
                if (processedIds.has(item.id)) return false;
                processedIds.add(item.id);
                return true;
            });

        return data.length > 0 ? data : backupEvents;
    } catch (error) {
        console.error('Error fetching Events:', error);
        return backupEvents;
    }
}

// ==================== MAGAZINES ====================
export async function getMagazines(): Promise<Magazine[]> {
    try {
        const rows = await fetchSheetData('Magazine');

        if (rows.length === 0) {
            console.warn('No data in Magazine sheet, using backup.');
            return backupMagazines;
        }

        const processedIds = new Set();

        const data: Magazine[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => ({
                contentType: 'magazine' as const,
                id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                title: row.title || '',
                titleThai: row.title_thai || undefined,
                year: parseInt(row.year) || 0,
                actors: parseActors(row.actors),
                magazineName: row.magazine_name || '',
                issue: row.issue || undefined,
                description: row.description || undefined,
                image: processImageUrl(row.image_url),
                link: row.link || parseLinks(row)[0]?.url || undefined,
            }))
            .filter((item: Magazine) => {
                if (processedIds.has(item.id)) return false;
                processedIds.add(item.id);
                return true;
            });

        return data.length > 0 ? data : backupMagazines;
    } catch (error) {
        console.error('Error fetching Magazines:', error);
        return backupMagazines;
    }
}

// ==================== AWARDS ====================
export async function getAwards(): Promise<Award[]> {
    try {
        const rows = await fetchSheetData('Award');

        if (rows.length === 0) {
            console.warn('No data in Award sheet, using backup.');
            return backupAwards;
        }

        const processedIds = new Set();

        const data: Award[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => ({
                contentType: 'award' as const,
                id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                awardName: row.award_name || row.title || '',
                awardNameThai: row.award_name_thai || row.title_thai || undefined,
                ceremony: row.ceremony || '',
                year: parseInt(row.year) || 0,
                actors: parseActors(row.actors),
                workTitle: row.work_title || undefined,
                description: row.description || undefined,
                image: processImageUrl(row.image_url),
                link: row.link || parseLinks(row)[0]?.url || undefined,
            }))
            .filter((item: Award) => {
                if (processedIds.has(item.id)) return false;
                processedIds.add(item.id);
                return true;
            });

        return data.length > 0 ? data : backupAwards;
    } catch (error) {
        console.error('Error fetching Awards:', error);
        return backupAwards;
    }
}

// ==================== GET ALL CONTENT ====================
export async function getAllContent(): Promise<ContentItem[]> {
    const [series, variety, events, magazines, awards] = await Promise.all([
        getSeries(),
        getVariety(),
        getEvents(),
        getMagazines(),
        getAwards(),
    ]);

    return [...series, ...variety, ...events, ...magazines, ...awards];
}

// ==================== LEGACY: GET WORKS (for backward compatibility) ====================
export async function getWorks(): Promise<Work[]> {
    try {
        const rows = await fetchSheetData('Works');

        if (rows.length === 0) {
            console.warn('No data in Works sheet, using backup.');
            return backupWorks;
        }

        const processedIds = new Set();

        const sheetWorks: Work[] = rows
            .filter((row: any) => row.visible === true || row.visible === 'TRUE' || row.visible === 'true')
            .map((row: any) => {
                const links = parseLinks(row);

                return {
                    id: String(row.data_id || Math.random().toString(36).substr(2, 9)),
                    title: row.title || '',
                    titleThai: row.title_thai || undefined,
                    year: parseInt(row.year) || 0,
                    type: (row.type || 'series') as any,
                    category: (row.category || 'acting') as any,
                    image: processImageUrl(row.image_url),
                    actors: parseActors(row.actors),
                    role: row.role || undefined,
                    links: links.length > 0 ? links : undefined,
                    link: links.length > 0 ? links[0].url : undefined,
                    platform: links.length > 0 ? links[0].platform : undefined,
                };
            })
            .filter((work: Work) => {
                if (processedIds.has(work.id)) return false;
                processedIds.add(work.id);
                return true;
            });

        return sheetWorks.length > 0 ? sheetWorks : backupWorks;
    } catch (error) {
        console.error('Error fetching Works:', error);
        return backupWorks;
    }
}
