const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../components/storefront/Navbar.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace liquid-glass
code = code.replace(/className="liquid-glass /g, 'className="bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm ');

// Replace gold-trim
code = code.replace(/className="gold-trim /g, 'className="bg-stone-900 ');

// Fix any leftover text-charcoalBrown if needed (it's safe as it's just dark text, but let's check if it exists)
// Actually charcoalBrown is not defined in Tailwind, it might be a custom class or maybe it's just text-[#2D2A26]
// I'll leave text-charcoalBrown if it is defined, but wait, `text-charcoalBrown` was used, maybe defined in globals? No.
// Let's replace text-charcoalBrown with text-stone-900 just to be safe.
code = code.replace(/text-charcoalBrown/g, 'text-stone-900');

fs.writeFileSync(file, code, 'utf8');
console.log('Navbar updated.');
