const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'ProductGrid.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The file is currently corrupted between lines 677 and the filter count banner.
// I will just download the original component and rebuild it or use a regex to fix it.
// Actually let's just find the `  const renderFiltersContent = () => (` function, and we know that finishes at line ~683.
// Then the return starts.

let originalReturnStart = `  return (
    <PublicJewelryBackground variant="shop" className="w-full min-h-screen" contentClassName="mx-auto max-w-7xl px-4 py-8">
      
      {/* Title block */}
      <div className="relative z-10 mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-champagne font-semibold">Anti Tarnish Jewels Collections</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif font-semibold tracking-wide text-charcoalBrown">{title}</h1>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-[#F1CFCF]/40 bg-white/55 backdrop-blur-md pl-10 pr-4 py-2.5 text-sm outline-none text-[#3B2B2B] focus:border-[#C98484] focus:ring-1 focus:ring-[#C98484] placeholder:text-[#9B7A7A]"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-[#C98484]/80" />
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-[#F1CFCF]/40 bg-white/55 backdrop-blur-md px-4 py-2.5 text-sm outline-none text-[#3B2B2B] cursor-pointer focus:border-[#C98484]"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="popular">Popularity</option>
            <option value="discount">Discount Offer</option>
            <option value="rating">Rating Score</option>
          </select>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#F1CFCF]/40 bg-white/55 backdrop-blur-md px-4 py-2.5 text-sm text-[#C98484] hover:bg-[#C98484]/10 lg:hidden transition-colors font-semibold"
          >
            <Filter size={16} />
            Filters
            {filtered.length !== products.length && (
              <span className="h-2 w-2 rounded-full bg-dustyRose inline-block" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-3xl border border-[#F1CFCF]/40 bg-white/55 backdrop-blur-md p-6 shadow-[0_20px_60px_rgba(224,169,165,0.15)] h-fit sticky top-24 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {renderFiltersContent()}
        </aside>

        {/* Products Grid Pane */}
        <div className="flex-1">
          {/* Active filter count banner */}
          <div className="mb-4 flex items-center justify-between text-xs text-stoneGray/75">
            <span>`;

// I will look for where `          </div>\n        )}\n      </div>\n    </div>\n  );` is or should be.

// Let's grab the file, delete everything from `              </div>\n            </div>\n          </div>` down to `Showing {filtered.length} of {products.length} Products`

const parts = content.split('          </div>\n        )}\n      </div>\n    </div>\n  );');
if (parts.length > 1) {
    // wait, it might be gone.
}

let endMarker = '              Showing {filtered.length} of {products.length} Products';
let startMarker = '              </div>\n            </div>\n          </div>';

let startIdx = content.indexOf(startMarker);
let endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  let toReplace = content.substring(startIdx + startMarker.length, endIdx);
  let newText = `
        )}
      </div>
    </div>
  );

${originalReturnStart}`;
  content = content.replace(toReplace, newText);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Fixed ProductGrid.tsx");
} else {
  console.log("Markers not found.");
}
