const fs = require('fs');
const path = require('path');

const compDir = path.join(__dirname, '..', 'components');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'admin' && file !== 'api') {
        processDir(fullPath);
      }
    } else if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace bg-warmwhite
      if (content.includes('bg-warmwhite') && !content.includes('bg-warmwhite/')) {
        content = content.replace(/bg-warmwhite/g, 'bg-white/70 backdrop-blur-md');
        changed = true;
      }
      // Replace bg-warmwhite/XX if we want to standardize
      if (content.match(/bg-warmwhite\/\d+/)) {
        content = content.replace(/bg-warmwhite\/\d+/g, 'bg-white/70 backdrop-blur-md');
        changed = true;
      }
      // Replace border-goldBeige (if not already part of border-goldBeige/XX)
      if (content.includes('border-goldBeige') && !content.includes('border-goldBeige/')) {
        content = content.replace(/border-goldBeige(?!\/)/g, 'border-[#F1CFCF]/50');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(compDir);
console.log('Done replacing comp bgs.');
