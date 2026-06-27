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

const tablesToCheck = [
  { table: 'content_items', fields: ['image'] },
  { table: 'gallery_items', fields: ['image'] },
  { table: 'brand_collaborations', fields: ['brand_logo'] },
  { table: 'fashion_events', fields: ['image_url'] },
  { table: 'hero_slides', fields: ['image'] },
  { table: 'site_settings', fields: ['value'] }
];

async function findImage() {
  const targetImage = '658903125_1528772718618964_4902303260615286599_n.jpg';
  console.log(`--- Searching database for image containing "${targetImage}" ---`);
  
  for (const item of tablesToCheck) {
    const selectFields = ['id', ...item.fields].join(',');
    const { data, error } = await supabase
      .from(item.table)
      .select(selectFields);
      
    if (error) {
      console.warn(`Failed to read from table ${item.table}:`, error.message);
      continue;
    }
    
    if (!data) continue;
    
    data.forEach((row) => {
      item.fields.forEach((field) => {
        const val = row[field];
        const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val || '');
        if (valStr.includes(targetImage)) {
          console.log(`🎯 FOUND match in table: "${item.table}"`);
          console.log(`   Row ID: ${row.id}`);
          console.log(`   Field name: "${field}"`);
          console.log(`   Value: ${valStr}`);
          console.log('----------------------------------------');
        }
      });
    });
  }
  
  console.log('--- Search complete ---');
}

findImage();
