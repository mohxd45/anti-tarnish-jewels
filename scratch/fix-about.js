const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/(storefront)/about/page.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/text-cream\/70/g, 'text-stone-600');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed about page.');
