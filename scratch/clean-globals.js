const fs = require('fs');
const path = require('path');

const globalsPath = path.join(__dirname, '../app/globals.css');
let css = fs.readFileSync(globalsPath, 'utf8');

// Update CSS variables for neutral elegant look
css = css.replace(/--color-main-bg: #FFF0F5;/g, '--color-main-bg: #FAF9F6;');
css = css.replace(/--color-section-bg: #FFE6EE;/g, '--color-section-bg: #F5F5F4;');
css = css.replace(/--color-card-bg: #FFF9FB;/g, '--color-card-bg: #FFFFFF;');
css = css.replace(/--color-noir: #FFF0F5;/g, '--color-noir: #FAF9F6;');
css = css.replace(/--color-noir-text: #3A2428;/g, '--color-noir-text: #2D2A26;');
css = css.replace(/--color-cream: #3A2428;/g, '--color-cream: #2D2A26;');
css = css.replace(/--color-charcoal: #FFF9FB;/g, '--color-charcoal: #FFFFFF;');

// Update `.glass`
css = css.replace(
  /\.glass \{\s+background: linear-gradient[^}]+}/,
  `.glass {
    background: rgba(250, 249, 246, 0.90);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(229, 231, 235, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }`
);

// Update `.glass-premium`
css = css.replace(
  /\.glass-premium \{\s+background: linear-gradient[^}]+}/,
  `.glass-premium {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(229, 231, 235, 0.8);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }`
);

// Update `.liquid-glass`
css = css.replace(
  /\.liquid-glass \{\s+background: [^}]+}/,
  `.liquid-glass {
    background: rgba(250, 249, 246, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  }`
);

fs.writeFileSync(globalsPath, css, 'utf8');
console.log('globals.css updated successfully.');
