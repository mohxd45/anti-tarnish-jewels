const fs = require('fs');
const path = require('path');

// Clean checkout disabled state
const checkoutFile = path.join(__dirname, '../app/(storefront)/checkout/page.tsx');
if (fs.existsSync(checkoutFile)) {
    let content = fs.readFileSync(checkoutFile, 'utf8');
    content = content.replace(/glass bg-white\/50/g, 'bg-stone-50 border-stone-200 text-stone-400');
    content = content.replace(/opacity-50 border border-goldBeige\/50/g, 'opacity-70 border border-stone-200');
    fs.writeFileSync(checkoutFile, content, 'utf8');
    console.log('checkout/page.tsx updated.');
}

// Clean homepage pink banners
const homeFile = path.join(__dirname, '../app/(storefront)/page.tsx');
if (fs.existsSync(homeFile)) {
    let content = fs.readFileSync(homeFile, 'utf8');
    content = content.replace(/bg-pink-100/g, 'bg-stone-50');
    content = content.replace(/text-pink-950/g, 'text-stone-900');
    content = content.replace(/text-pink-100/g, 'text-stone-100');
    content = content.replace(/bg-pink-50/g, 'bg-stone-50');
    content = content.replace(/bg-pink-900/g, 'bg-stone-900');
    fs.writeFileSync(homeFile, content, 'utf8');
    console.log('page.tsx (Home) updated.');
}
