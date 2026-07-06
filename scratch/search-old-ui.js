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

const dirs = [path.join(__dirname, '../app/(storefront)'), path.join(__dirname, '../components/storefront'), path.join(__dirname, '../components')];
let allFiles = [];
dirs.forEach(d => {
    if(fs.existsSync(d)) allFiles = allFiles.concat(walk(d));
});

const patterns = ['shadow-jewel', 'bg-beige', 'text-champagne', 'bg-champagne', 'border-goldBeige', 'border-gold', 'bg-white/80', 'border-gold/15', 'glass '];

allFiles.forEach(file => {
    // Skip admin
    if(file.includes('components\\admin') || file.includes('app\\admin')) return;
    
    const content = fs.readFileSync(file, 'utf8');
    patterns.forEach(p => {
        if(content.includes(p)) {
            console.log(`Found ${p} in ${file.split('anti-tarnish-jewels-latest-antigravity')[1]}`);
        }
    });
});
