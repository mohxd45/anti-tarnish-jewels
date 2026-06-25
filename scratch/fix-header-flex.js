const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Header.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the entire <header> element
const headerRegex = /<header className="sticky top-0 z-\[100\][^>]*>[\s\S]*?<\/header>/;

const newHeader = `<header className="sticky top-0 z-[100] border-b border-[#F1CFCF]/70 bg-white/85 backdrop-blur-md shadow-sm h-[72px] sm:h-[88px] flex items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo Area (Fixed Width to prevent overlap) */}
          <Link href="/" className="group flex items-center gap-3 shrink-0 xl:min-w-[180px]">
            {/* Monogram Box 40x40 */}
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-champagne/50 bg-champagne/5 rounded-sm group-hover:border-champagne group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-500">
              <span className="font-serif text-lg sm:text-xl font-bold text-champagne tracking-tighter">AT</span>
            </div>
            {/* Brand Text strictly AT JEWELS */}
            <div className="flex flex-col">
              <span className="font-serif text-[15px] sm:text-[17px] font-medium tracking-[0.1em] text-[#3B2B2B] uppercase transition-colors group-hover:text-champagne whitespace-nowrap">
                AT JEWELS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Only visible >= 1280px to prevent crowding) */}
          <nav className="hidden xl:flex items-center justify-center gap-6 text-[12px] uppercase tracking-wider font-semibold flex-1 min-w-0 px-4 whitespace-nowrap">
            {renderNavLinks(false)}
          </nav>

          {/* Right Icon Actions (Fixed min-width to balance logo) */}
          <div className="flex items-center justify-end gap-3 shrink-0 xl:min-w-[180px]">
            {isAdmin && (
              <Link href="/admin" className="hidden sm:flex items-center justify-center rounded-full bg-champagne/10 text-champagne px-4 h-10 text-sm font-bold hover:bg-champagne hover:text-white transition-all shadow-sm border border-champagne/40">
                Admin
              </Link>
            )}
            <Link href="/shop" aria-label="Search" className={iconClass}>
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className={\`\${iconClass} hidden sm:flex\`}>
              <Heart size={20} />
              {wishlist.items.length > 0 && <span className={badgeClass}>{wishlist.items.length}</span>}
            </Link>
            <Link href="/cart" aria-label="Cart" className={iconClass}>
              <ShoppingBag className="h-5 w-5" />
              {items.length > 0 && <span className={badgeClass}>{items.length}</span>}
            </Link>
            <Link href={user ? "/account" : "/login"} aria-label="Account" className={\`\${iconClass} hidden sm:flex\`}>
              <User size={20} />
            </Link>
            {/* Hamburger menu visible below 1280px */}
            <button onClick={() => setOpen(true)} className={\`\${iconClass} xl:hidden\`} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>`;

content = content.replace(headerRegex, newHeader);

// 2. Update iconClass and badgeClass for the specific 44x44 / 11w-11h sizing
const oldIconClassRegex = /const iconClass = "[^"]*";/;
const newIconClass = `const iconClass = "group relative flex items-center justify-center rounded-full border border-champagne/40 w-10 h-10 sm:w-11 sm:h-11 bg-white/50 hover:bg-white hover:border-champagne hover:shadow-[0_0_15px_rgba(224,169,165,0.3)] transition-all duration-300 hover:scale-[1.03] text-charcoalBrown hover:text-champagne shrink-0";`;
content = content.replace(oldIconClassRegex, newIconClass);

// Write changes
fs.writeFileSync(file, content, 'utf8');
console.log('Header.tsx completely rebuilt with stable flex layout!');
