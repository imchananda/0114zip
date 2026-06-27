import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing since dotenv isn't installed
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlides() {
  console.log('--- Checking active Hero Slides for fbcdn.net URLs ---');
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch slides:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No slides found in database.');
    return;
  }

  console.log(`Found ${data.length} total slides.\n`);

  let fbcdnCount = 0;
  data.forEach((slide) => {
    const isFb = slide.image && (slide.image.includes('fbcdn.net') || slide.image.includes('scontent'));
    if (isFb) {
      fbcdnCount++;
      console.log(`❌ Slide ID: ${slide.id}`);
      console.log(`   Title: ${slide.title || 'Untitled'} (${slide.title_thai || 'ไม่มีภาษาไทย'})`);
      console.log(`   URL: ${slide.image}`);
      console.log('----------------------------------------');
    } else {
      console.log(`✅ Slide ID: ${slide.id}`);
      console.log(`   Title: ${slide.title || 'Untitled'}`);
      console.log(`   URL: ${slide.image}`);
      console.log('----------------------------------------');
    }
  });

  if (fbcdnCount === 0) {
    console.log('\n🎉 ยอดเยี่ยม! ไม่พบสไลด์ที่เป็นลิงก์ Facebook CDN (fbcdn.net) ในฐานข้อมูลเลยครับ');
  } else {
    console.log(`\n⚠️ พบสไลด์ที่เป็น Facebook CDN ทั้งหมด ${fbcdnCount} รายการ`);
  }
}

checkSlides();
