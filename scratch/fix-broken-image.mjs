import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import http from 'http';

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

async function run() {
  const targetId = 'df094980-85f9-4a79-a0d8-b4b1b484fefd';
  const newImage = 'https://img.youtube.com/vi/lDUD3omAlHA/maxresdefault.jpg';
  
  console.log(`--- Updating image URL for Favorite Toxic (${targetId}) ---`);
  console.log(`New image: ${newImage}`);
  
  const { data, error } = await supabase
    .from('content_items')
    .update({ image: newImage })
    .eq('id', targetId)
    .select();
    
  if (error) {
    console.error('❌ Failed to update image URL:', error.message);
    return;
  }
  
  console.log('✅ Database updated successfully! Row state:');
  console.log(JSON.stringify(data, null, 2));
  
  // Try to trigger revalidation on localhost
  console.log('\n--- Attempting to revalidate Next.js cache ---');
  
  const revalidatePayload = JSON.stringify({ tag: 'content_items' });
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Try common ports (e.g. 3000)
  const ports = [3000, 3001];
  for (const port of ports) {
    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/api/admin/revalidate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Length': Buffer.byteLength(revalidatePayload)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✅ Cache revalidated successfully on port ${port}! Response:`, body);
          } else {
            console.log(`⚠️ Revalidation response on port ${port} (Status ${res.statusCode}):`, body);
          }
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`ℹ️ Could not connect to localhost:${port} for revalidation: ${err.message}`);
        resolve();
      });
      
      req.write(revalidatePayload);
      req.end();
    });
  }
}

run();
