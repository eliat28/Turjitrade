/**
 * TurjiTrade PWA Icons Generator
 * This script generates PNG icons from SVG for PWA support
 * Run: node generate-pwa-icons.js
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, 'public');

// Create the TurjiTrade logo on a canvas
function createLogo(canvas, size) {
    const ctx = canvas.getContext('2d');
    const scale = size / 512;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Background circle
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
    
    // T Letter - horizontal bar
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(200*scale, 140*scale, 112*scale, 32*scale, 4*scale);
    ctx.fill();
    
    // T Letter - vertical bar
    ctx.beginPath();
    ctx.roundRect(240*scale, 140*scale, 32*scale, 232*scale, 4*scale);
    ctx.fill();
    
    // Stock Chart Line
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 8 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(140*scale, 280*scale);
    ctx.lineTo(180*scale, 260*scale);
    ctx.lineTo(220*scale, 300*scale);
    ctx.lineTo(260*scale, 240*scale);
    ctx.lineTo(300*scale, 220*scale);
    ctx.lineTo(340*scale, 260*scale);
    ctx.lineTo(372*scale, 200*scale);
    ctx.stroke();
    
    // Chart Points
    const points = [
        {x: 140, y: 280},
        {x: 180, y: 260},
        {x: 220, y: 300},
        {x: 260, y: 240},
        {x: 300, y: 220},
        {x: 340, y: 260},
        {x: 372, y: 200}
    ];
    
    ctx.fillStyle = '#10b981';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x*scale, point.y*scale, 6*scale, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // AI Sparkle Icon - large star
    ctx.save();
    ctx.translate(340*scale, 140*scale);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(12*scale, 0);
    ctx.lineTo(14*scale, 10*scale);
    ctx.lineTo(24*scale, 12*scale);
    ctx.lineTo(14*scale, 14*scale);
    ctx.lineTo(12*scale, 24*scale);
    ctx.lineTo(10*scale, 14*scale);
    ctx.lineTo(0, 12*scale);
    ctx.lineTo(10*scale, 10*scale);
    ctx.closePath();
    ctx.fill();
    
    // AI Sparkle Icon - small star
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.moveTo(18*scale, 4*scale);
    ctx.lineTo(19*scale, 8*scale);
    ctx.lineTo(23*scale, 9*scale);
    ctx.lineTo(19*scale, 10*scale);
    ctx.lineTo(18*scale, 14*scale);
    ctx.lineTo(17*scale, 10*scale);
    ctx.lineTo(13*scale, 9*scale);
    ctx.lineTo(17*scale, 8*scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Generate all icon sizes
async function generateIcons() {
    console.log('🚀 Starting TurjiTrade PWA icon generation...\n');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (const size of sizes) {
        try {
            const canvas = createCanvas(size, size);
            createLogo(canvas, size);
            
            const filename = `icon-${size}x${size}.png`;
            const filepath = path.join(outputDir, filename);
            
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filepath, buffer);
            
            console.log(`✅ Generated: ${filename} (${size}x${size}px)`);
        } catch (error) {
            console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
        }
    }
    
    console.log('\n✨ All icons generated successfully!');
    console.log('📁 Icons saved to:', outputDir);
    console.log('\n📋 Next steps:');
    console.log('1. Verify all PNG files are in /public directory');
    console.log('2. Update manifest.json to reference PNG files');
    console.log('3. Test PWA installation on mobile devices');
}

// Run the generator
generateIcons().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
