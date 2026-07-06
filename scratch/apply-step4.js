const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const dirs = [
    path.join(__dirname, '../app/(storefront)'), 
    path.join(__dirname, '../components/storefront')
];

let allFiles = [];
dirs.forEach(d => {
    if(fs.existsSync(d)) allFiles = allFiles.concat(walk(d));
});

// Also include specific shared components
const specificFiles = [
    'components/ProductGrid.tsx',
    'components/ProductCard.tsx',
    'components/ProductDetailsClient.tsx',
    'components/Protected.tsx'
].map(f => path.join(__dirname, '../', f));

allFiles = allFiles.concat(specificFiles);

let filesChanged = [];

allFiles.forEach(file => {
    // Skip admin just in case
    if(file.includes('components\\admin') || file.includes('app\\admin')) return;
    if(!fs.existsSync(file)) return;
    
    let original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Replace muddy beige
    content = content.replace(/bg-beige/g, 'bg-stone-50');
    
    // Replace muddy/heavy borders
    content = content.replace(/border-goldBeige/g, 'border-stone-200');
    content = content.replace(/border-gold\/15/g, 'border-stone-200');
    // For border-gold, only replace if it's not a button or accent we want to keep?
    // Actually, border-gold on storefront often just looks old. But let's only replace it where it was used as a structural border.
    content = content.replace(/border-gold /g, 'border-stone-200 ');
    content = content.replace(/border-gold"/g, 'border-stone-200"');
    
    // Soften shadows
    content = content.replace(/shadow-jewel/g, 'shadow-sm');
    
    // Clean glass
    content = content.replace(/glass bg-white\/80/g, 'bg-white/95 backdrop-blur-sm');
    content = content.replace(/bg-white\/80/g, 'bg-white/95 backdrop-blur-sm');
    
    // We KEEP text-champagne and bg-champagne as accents.
    // Also we KEEP border-t-champagne as accent.

    if(content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        filesChanged.push(file.split('anti-tarnish-jewels-latest-antigravity')[1]);
    }
});

console.log('Files changed:', filesChanged.length);
console.log(filesChanged.join('\n'));
