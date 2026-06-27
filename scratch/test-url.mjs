import https from 'https';

const urls = [
  'https://img.youtube.com/vi/lDUD3omAlHA/maxresdefault.jpg',
  'https://img.youtube.com/vi/lDUD3omAlHA/hqdefault.jpg',
  'https://i.ytimg.com/vi/lDUD3omAlHA/maxresdefault.jpg'
];

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (e) => {
      console.error(`URL: ${url} -> Error: ${e.message}`);
      resolve(500);
    });
  });
}

async function run() {
  for (const url of urls) {
    await testUrl(url);
  }
}

run();
