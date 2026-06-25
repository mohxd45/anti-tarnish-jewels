const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Header.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Move Admin from nav to right icons
content = content.replace(
  /{isAdmin && \(\s*<Link href="\/admin"[\s\S]*?<\/Link>\s*\)}/g,
  ''
);

// 2. Adjust nav classes to be smaller so it doesn't push the right side out
content = content.replace(
  /<nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-7 text-\[12px\] xl:text-\[13px\] uppercase tracking-widest font-medium flex-1 px-4 h-full">/g,
  `<nav className="hidden lg:flex items-center justify-center gap-2 xl:gap-6 text-[10px] xl:text-[12px] uppercase tracking-wider font-semibold flex-1 px-2 h-full overflow-hidden">`
);

// 3. Put Admin in the right side
content = content.replace(
  /{\/\* Right Icon Actions \*\/}\s*<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">/,
  `{/* Right Icon Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
            {isAdmin && (
              <Link href="/admin" className="hidden sm:flex items-center justify-center rounded-full bg-champagne text-charcoalBrown px-3 py-1.5 text-xs font-bold hover:bg-champagne/80 transition-colors shadow-sm border border-goldBeige">
                Admin
              </Link>
            )}`
);

// 4. Ensure right icons have slightly smaller sizes on small desktops if needed
content = content.replace(
  /const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne\/40 w-9 h-9 sm:w-10 sm:h-10 bg-white\/50 hover:bg-white hover:border-champagne hover:shadow-\[0_0_15px_rgba\(224,169,165,0.3\)\] transition-all duration-300 hover:scale-\[1.03\] text-charcoalBrown hover:text-champagne";/,
  `const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne/40 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/50 hover:bg-white hover:border-champagne hover:shadow-[0_0_15px_rgba(224,169,165,0.3)] transition-all duration-300 hover:scale-[1.03] text-charcoalBrown hover:text-champagne shrink-0";`
);

// 5. Ensure "AT Jewels" logo area is flexible
content = content.replace(
  /<Link href="\/" className="group flex items-center gap-2.5 sm:gap-3 flex-shrink-0">/g,
  `<Link href="/" className="group flex items-center gap-2 sm:gap-3 shrink-0">`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Header.tsx updated!');
