const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("Error reading .env.local", e);
}

console.log("URL:", supabaseUrl);
console.log("Key length:", supabaseKey ? supabaseKey.length : 0);

const db = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await db.from('artist_profiles').select('*').limit(1);
  if (error) {
    console.error("DB SELECT Error:", error);
  } else {
    console.log("DB SELECT Row keys:", Object.keys(data[0] || {}));
    console.log("DB SELECT Row data:", data[0]);
  }
}

run();
