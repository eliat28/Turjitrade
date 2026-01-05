// Script to generate PWA icons for TurjiTrade
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// SVG template for the icon
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="256" fill="#0a0a0a"/>
  
  <!-- Gradient Definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Letter T with Stock Chart -->
  <g>
    <!-- T Letter -->
    <rect x="200" y="140" width="112" height="32" rx="4" fill="url(#gradient)"/>
    <rect x="240" y="140" width="32" height="232" rx="4" fill="url(#gradient)"/>
    
    <!-- Stock Chart Line -->
    <path d="M 140 280 L 180 260 L 220 300 L 260 240 L 300 220 L 340 260 L 372 200" 
          stroke="url(#gradient)" 
          stroke-width="8" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
    
    <!-- Chart Points -->
    <circle cx="140" cy="280" r="6" fill="#10b981"/>
    <circle cx="180" cy="260" r="6" fill="#10b981"/>
    <circle cx="220" cy="300" r="6" fill="#10b981"/>
    <circle cx="260" cy="240" r="6" fill="#10b981"/>
    <circle cx="300" cy="220" r="6" fill="#10b981"/>
    <circle cx="340" cy="260" r="6" fill="#10b981"/>
    <circle cx="372" cy="200" r="6" fill="#10b981"/>
    
    <!-- AI Sparkle Icon -->
    <g transform="translate(340, 140)">
      <path d="M 12 0 L 14 10 L 24 12 L 14 14 L 12 24 L 10 14 L 0 12 L 10 10 Z" fill="#10b981"/>
      <path d="M 18 4 L 19 8 L 23 9 L 19 10 L 18 14 L 17 10 L 13 9 L 17 8 Z" fill="#34d399"/>
    </g>
  </g>
</svg>`;

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons in different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Created ${filename}`);
});

// Copy the 512x512 as the main logo
const mainLogoPath = path.join(publicDir, 'logo.svg');
fs.copyFileSync(
  path.join(publicDir, 'icon-512x512.svg'),
  mainLogoPath
);
console.log('✓ Created logo.svg');

console.log('\n✅ All icons generated successfully!');
console.log('\nNote: SVG icons have been created. For production, you may want to convert them to PNG.');
console.log('You can use an online tool or library like sharp to convert SVG to PNG in various sizes.');
