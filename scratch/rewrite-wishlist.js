const fs = require('fs');

function rewriteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/const \{ addItem: addWishlist, removeItem: removeWishlist, items: wishlist \} = useWishlist\(\);/, 'const { addToWishlist: addWishlist, removeFromWishlist: removeWishlist, items: wishlist } = useWishlist();');
  fs.writeFileSync(filePath, content);
}

rewriteFile('components/ProductCard.tsx');
rewriteFile('components/ProductDetailsClient.tsx');
