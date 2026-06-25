const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Header.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Admin button from top navbar
content = content.replace(
  /{isAdmin && \(\s*<Link href="\/admin"[\s\S]*?<\/Link>\s*\)}/g,
  ''
);

// 2. Make Header medium slim (reduce height from h-[72px] sm:h-[88px] to h-16 sm:h-[68px])
content = content.replace(
  /className="sticky top-0 z-\[100\] border-b border-\[\#F1CFCF\]\/70 bg-white\/85 backdrop-blur-md shadow-sm h-\[72px\] sm:h-\[88px\] flex items-center"/,
  `className="sticky top-0 z-[100] border-b border-[#F1CFCF]/70 bg-white/85 backdrop-blur-md shadow-sm h-16 sm:h-[68px] flex items-center"`
);

// 3. Make logo monogram medium slim (w-9 h-9 sm:w-10 sm:h-10 to w-8 h-8 sm:w-[36px] sm:h-[36px])
content = content.replace(
  /className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-champagne\/50/g,
  `className="flex items-center justify-center w-8 h-8 sm:w-[36px] sm:h-[36px] border border-champagne/50`
);

// 4. Shrink icon class a bit if needed (w-10 h-10 sm:w-11 sm:h-11 to w-9 h-9 sm:w-[42px] sm:h-[42px])
content = content.replace(
  /const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne\/40 w-10 h-10 sm:w-11 sm:h-11/,
  `const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne/40 w-10 h-10 sm:w-[42px] sm:h-[42px]`
);

// 5. Let's make sure the center nav gap is comfortable
content = content.replace(
  /<nav className="hidden xl:flex items-center justify-center gap-6 text-\[12px\] uppercase tracking-wider font-semibold flex-1 min-w-0 px-4 whitespace-nowrap">/,
  `<nav className="hidden xl:flex items-center justify-center gap-5 xl:gap-6 text-[12px] uppercase tracking-wider font-semibold flex-1 min-w-0 px-4 whitespace-nowrap">`
);

// 6. Right side doesn't need as large of a min-width now that admin is gone.
// Left was xl:min-w-[180px], Right was xl:min-w-[180px]. That's perfect to keep them balanced. 

fs.writeFileSync(file, content, 'utf8');
console.log('Header.tsx updated: removed Admin button, reduced header height.');
