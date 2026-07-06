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
            if(file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const storefrontDir = path.join(__dirname, '../app/(storefront)');
const files = walk(storefrontDir);

// Target replacements
const glassRegex = /glass bg-white\/\d+[^"]*border-goldBeige[^"]*/g;
const newGlass = "bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl";

const muddyPinkRegex = /bg-dustyRose\/10 border border-dustyRose\/20 text-dustyRose/g;
const newMuddyPink = "bg-stone-100 border border-stone-200 text-stone-600";

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(glassRegex, newGlass);
    
    // Some don't have border-goldBeige but have glass bg-white/80
    content = content.replace(/glass bg-white\/80 shadow-sm p-6 rounded-\[2rem\]/g, `p-6 ${newGlass}`);
    content = content.replace(/glass bg-white\/80 shadow-sm rounded-3xl/g, `rounded-2xl ${newGlass}`);
    
    // track-order
    content = content.replace(muddyPinkRegex, newMuddyPink);

    // Some custom glass variants in orders/[orderNumber]/page.tsx
    content = content.replace(/bg-white\/70 backdrop-blur-md/g, "bg-[#FAF9F6]/95 backdrop-blur-sm");
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Replaced glass boilerplate in ${modifiedCount} files.`);
