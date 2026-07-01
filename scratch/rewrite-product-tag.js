const fs = require('fs');

function rewriteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/product\.tag/g, 'product.tags?.[0]');
  fs.writeFileSync(filePath, content);
}

rewriteFile('components/ProductCard.tsx');
