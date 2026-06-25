const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'ProductGrid.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace PublicJewelryBackground
content = content.replace(
  /<PublicJewelryBackground variant="shop" className="w-full min-h-screen" contentClassName="mx-auto max-w-7xl px-4 py-8">/g,
  `<div className="relative min-h-[100svh] w-full pb-20 pt-28 sm:pt-36" style={{ background: "var(--gradient-luxe)" }}>
      <div className="mx-auto max-w-7xl px-6">`
);

content = content.replace(
  /<\/PublicJewelryBackground>/g,
  `      </div>
    </div>`
);

// We should also replace the glass sidebar to use the Lovable glass class.
content = content.replace(
  /bg-white\/55 backdrop-blur-md/g,
  'glass'
);
content = content.replace(
  /border-\[\#F1CFCF\]\/40/g,
  'border-ink/10'
);

fs.writeFileSync(file, content, 'utf8');
console.log('ProductGrid.tsx updated for Lovable background styling.');
