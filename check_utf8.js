const fs = require('fs');
const files = [
  'app/(storefront)/terms-and-conditions/page.tsx',
  'app/(storefront)/privacy-policy/page.tsx',
  'app/(storefront)/refund-cancellation-policy/page.tsx',
  'app/(storefront)/return-policy/page.tsx',
  'app/(storefront)/shipping-policy/page.tsx',
  'components/storefront/Footer.tsx',
  'components/storefront/MobileFooterAccordion.tsx'
];
const decoder = new TextDecoder('utf-8', { fatal: true });
for (const f of files) {
  try {
    const buf = fs.readFileSync(f);
    decoder.decode(buf);
    console.log(f + ': UTF-8 VALID');
  } catch (e) {
    console.log(f + ': UTF-8 INVALID - ' + e.message);
  }
}
