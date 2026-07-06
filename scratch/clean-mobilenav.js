const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../components/storefront/MobileNav.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace bg-pink-900/40 with bg-black/20
code = code.replace(/bg-pink-900\/40/g, 'bg-black/20');

// Replace linear-gradient(180deg, #FDF2F8 0%, #FAF0E6 100%) with solid clean color
code = code.replace(/background: "linear-gradient[^"]+"/g, 'background: "#FAF9F6"');

fs.writeFileSync(file, code, 'utf8');
console.log('MobileNav updated.');
