const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

c = c.replace(
  '        {/* Trust Badges */}\r\n        <ScrollReveal><TrustBadges /></ScrollReveal>',
  '        {/* Trust Badges */}\r\n        <TrustBadges />'
);
c = c.replace(
  '        {/* Trust Badges */}\n        <ScrollReveal><TrustBadges /></ScrollReveal>',
  '        {/* Trust Badges */}\n        <TrustBadges />'
);

// We need to wrap each renderSection call in PublicJewelryBackground
const replacements = [
  '        case "flash-deals": {',
  '        case "trending": {',
  '        case "new-arrivals": {',
  '        case "category-grid": {',
  '        case "budget": {',
  '        case "best-sellers": {',
  '        case "reviews": {'
];

for (const rep of replacements) {
  let searchBlock = '          return (\r\n            <ScrollReveal';
  let replaceBlock = '          return (\r\n            <PublicJewelryBackground variant="section"><ScrollReveal';
  if (!c.includes(searchBlock)) {
    searchBlock = '          return (\n            <ScrollReveal';
    replaceBlock = '          return (\n            <PublicJewelryBackground variant="section"><ScrollReveal';
  }
  
  // We need to do this carefully by finding the return block after the case
  const idx = c.indexOf(rep);
  if (idx !== -1) {
    const returnIdx = c.indexOf('          return (', idx);
    if (returnIdx !== -1) {
      const scrollIdx = c.indexOf('<ScrollReveal', returnIdx);
      if (scrollIdx !== -1 && scrollIdx - returnIdx < 50) {
        c = c.substring(0, scrollIdx) + '<PublicJewelryBackground variant="section" contentClassName="bg-transparent">' + c.substring(scrollIdx);
      }
      
      // Find the closing ScrollReveal
      const closeIdx = c.indexOf('</ScrollReveal>', scrollIdx);
      if (closeIdx !== -1) {
        c = c.substring(0, closeIdx + 15) + '</PublicJewelryBackground>' + c.substring(closeIdx + 15);
      }
    }
  }
}

fs.writeFileSync('app/page.tsx', c);
