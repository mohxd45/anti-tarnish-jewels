const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'tailwind.config.ts');
let content = fs.readFileSync(file, 'utf8');

// Add new colors
const colorsInsertion = `
        // Lovable Radiant Showroom Palette
        blush: "oklch(0.93 0.045 20)",
        "blush-deep": "oklch(0.83 0.08 18)",
        "rose-gold": "oklch(0.74 0.105 45)",
        gold: "oklch(0.78 0.13 75)",
        ink: "oklch(0.18 0.03 20)",
`;

content = content.replace(
  /colors: {/,
  `colors: {${colorsInsertion}`
);

// Add new box shadows
const shadowInsertion = `
        glow: "0 20px 60px -15px oklch(0.74 0.105 45 / 0.45)",
        soft: "0 30px 80px -30px oklch(0.5 0.1 20 / 0.35)",
        glass: "0 8px 32px oklch(0.5 0.08 20 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.5)",
`;

content = content.replace(
  /boxShadow: {/,
  `boxShadow: {${shadowInsertion}`
);

// Add new background images
const bgInsertion = `
        "gradient-luxe": "linear-gradient(135deg, oklch(0.93 0.06 20) 0%, oklch(0.86 0.09 35) 50%, oklch(0.82 0.11 55) 100%)",
        "gradient-gold": "linear-gradient(135deg, oklch(0.86 0.08 80), oklch(0.74 0.105 45), oklch(0.88 0.07 70))",
        "gradient-spotlight": "radial-gradient(ellipse at top, oklch(0.95 0.05 30 / 0.9), oklch(0.88 0.07 20 / 0.4) 40%, transparent 70%)",
        "gradient-deep": "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.86 0.08 18) 100%)",
`;

content = content.replace(
  /backgroundImage: {/,
  `backgroundImage: {${bgInsertion}`
);

// Also add font families
const fontInsertion = `
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
`;

content = content.replace(
  /extend: {/,
  `extend: {${fontInsertion}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('tailwind.config.ts updated with Lovable styles.');
