const fs = require('fs');

let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error("Error reading .env.local", e);
}

if (!supabaseKey) {
  console.error("No service key found");
  process.exit(1);
}

async function run() {
  const url = 'http://localhost:3000/api/admin/revalidate';
  console.log("Triggering revalidation at", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ tag: 'settings' })
    });
    const json = await res.json();
    console.log("Response:", json);
  } catch (err) {
    console.error("Failed to revalidate:", err);
  }
}

run();
