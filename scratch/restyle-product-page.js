const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'components', 'ProductDetailsClient.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Wrap the right column in the white/80 panel
content = content.replace(
  /{[/][*] Right Column: Content and buy actions [*][/]}\s*<div>/g,
  `{/* Right Column: Content and buy actions */}
        <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(224,169,165,0.15)] relative z-10 border border-[#F1CFCF]/40">`
);

// Title color
content = content.replace(
  /<h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-wide text-charcoalBrown leading-tight break-words">/g,
  `<h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-wide text-[#3B2B2B] leading-tight break-words">`
);

// Breadcrumbs
content = content.replace(
  /text-champagne font-semibold/g,
  `text-[#8A5A2B] font-semibold`
);

// Review text
content = content.replace(
  /text-stoneGray\/60/g,
  `text-[#7A6262]`
);

// Price color
content = content.replace(
  /text-charcoalBrown break-all sm:break-normal/g,
  `text-[#8A5A2B] break-all sm:break-normal`
);
content = content.replace(
  /text-stoneGray\/60 line-through/g,
  `text-[#7A6262] line-through`
);

// Description
content = content.replace(
  /<p className="mt-6 text-sm md:text-base leading-7 text-charcoalBrown\/75 font-sans">/g,
  `<p className="mt-6 text-sm md:text-base leading-7 text-[#5F4747] font-sans">`
);

// Options
content = content.replace(
  /text-stoneGray block text-xs/g,
  `text-[#7A6262] block text-xs`
);
content = content.replace(
  /font-semibold text-charcoalBrown/g,
  `font-semibold text-[#3B2B2B]`
);

// Buy now
content = content.replace(
  /bg-dustyRose\/10/g,
  `bg-[#C98484]`
);
content = content.replace(
  /text-dustyRose/g,
  `text-white`
);
content = content.replace(
  /hover:bg-dustyRose/g,
  `hover:bg-[#a66a6a]`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('ProductDetailsClient styled successfully!');
