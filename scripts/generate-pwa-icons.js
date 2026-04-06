/**
 * PWA Icon Generator — creates NamtanFilm branded icons as SVG→PNG
 * Run: node scripts/generate-pwa-icons.js
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVG(size) {
  const padding = Math.round(size * 0.15);
  const innerSize = size - padding * 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const fontSize = Math.round(size * 0.35);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0A0F"/>
      <stop offset="100%" style="stop-color:#12121A"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E88E5"/>
      <stop offset="100%" style="stop-color:#FDD835"/>
    </linearGradient>
    <linearGradient id="glow-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E88E5;stop-opacity:0.4"/>
      <stop offset="100%" style="stop-color:#1E88E5;stop-opacity:0"/>
    </linearGradient>
    <linearGradient id="glow-yellow" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#FDD835;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#FDD835;stop-opacity:0"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <!-- Glow orbs -->
  <circle cx="${Math.round(size * 0.25)}" cy="${Math.round(size * 0.25)}" r="${Math.round(size * 0.35)}" fill="url(#glow-blue)"/>
  <circle cx="${Math.round(size * 0.75)}" cy="${Math.round(size * 0.75)}" r="${Math.round(size * 0.35)}" fill="url(#glow-yellow)"/>
  <!-- NF text -->
  <text x="${centerX}" y="${centerY + fontSize * 0.1}" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="url(#brand)" text-anchor="middle" dominant-baseline="middle">NF</text>
  <!-- Gradient bar -->
  <rect x="${Math.round(size * 0.25)}" y="${Math.round(size * 0.72)}" width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.025)}" rx="${Math.round(size * 0.013)}" fill="url(#brand)"/>
</svg>`;
}

// Generate SVG files (can be converted to PNG with sharp or other tools)
sizes.forEach(size => {
  const svg = generateSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`  ✅ Generated ${filename}`);
});

// Also generate apple-touch-icon (180x180)
const appleSvg = generateSVG(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleSvg);
console.log('  ✅ Generated apple-touch-icon.svg');

// Generate favicon SVGs
const favicon32 = generateSVG(32);
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.svg'), favicon32);
console.log('  ✅ Generated favicon-32x32.svg');

const favicon16 = generateSVG(16);
fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.svg'), favicon16);
console.log('  ✅ Generated favicon-16x16.svg');

console.log('\n🎉 All PWA icons generated!');
console.log('📝 Note: SVG icons are generated. For PNG conversion, use:');
console.log('   npx sharp-cli -i public/icons/icon-192x192.svg -o public/icons/icon-192x192.png');
