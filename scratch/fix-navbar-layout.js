const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Header.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Grid layout instead of flex
content = content.replace(
  /<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">/,
  `<div className="mx-auto grid w-full max-w-7xl items-center grid-cols-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] px-4 sm:px-6 gap-4">`
);

// 2. Logo adjustments
content = content.replace(
  /tracking-\[0.2em\] sm:tracking-\[0.25em\]/g,
  `tracking-[0.1em] sm:tracking-[0.15em]`
);
content = content.replace(
  /<Link href="\/" className="group flex items-center gap-2 sm:gap-3 shrink-0">/,
  `<Link href="/" className="group flex items-center gap-2 sm:gap-3 shrink-0 lg:mr-4">`
);

// 3. Nav adjustments
content = content.replace(
  /<nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-6 text-\[10px\] xl:text-\[12px\] uppercase tracking-wider font-semibold flex-1 px-2 h-full overflow-hidden">/g,
  `<nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-7 text-[11px] xl:text-xs uppercase tracking-widest font-medium min-w-0 h-full">`
);

// 4. Right icons alignment
content = content.replace(
  /<div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">/,
  `<div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">`
);

// 5. Admin button
content = content.replace(
  /{isAdmin && \(\s*<Link href="\/admin"[\s\S]*?<\/Link>\s*\)}/g,
  `{isAdmin && (
              <Link href="/admin" className="hidden lg:flex items-center justify-center rounded-full bg-champagne/10 text-champagne px-4 h-9 lg:h-10 text-[11px] lg:text-xs font-bold hover:bg-champagne hover:text-white transition-all shadow-sm border border-champagne/40">
                Admin
              </Link>
            )}`
);

// 6. Fix Menu button for grid layout (it's inside the right group, which is fine)
// Make sure right icons has justify-end so it pushes to the right. Done above.

// 7. Icon class
content = content.replace(
  /const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne\/40 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white\/50 hover:bg-white hover:border-champagne hover:shadow-\[0_0_15px_rgba\(224,169,165,0.3\)\] transition-all duration-300 hover:scale-\[1.03\] text-charcoalBrown hover:text-champagne shrink-0";/,
  `const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne/40 w-9 h-9 lg:w-10 lg:h-10 bg-white/50 hover:bg-white hover:border-champagne hover:shadow-[0_0_15px_rgba(224,169,165,0.3)] transition-all duration-300 hover:scale-[1.03] text-charcoalBrown hover:text-champagne shrink-0";`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Header.tsx layout updated!');
