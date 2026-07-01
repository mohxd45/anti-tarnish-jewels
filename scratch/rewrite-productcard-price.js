const fs = require('fs');
let content = fs.readFileSync('components/ProductCard.tsx', 'utf8');

content = content.replace(/const \{ dispatch: cartDispatch \} = useCart\(\);/, 'const { addToCart } = useCart();');
content = content.replace(/cartDispatch\(\{ type: "ADD_ITEM", payload: \{ product, quantity: 1 \} \}\);/, 'addToCart(product, 1);');
content = content.replace(/product\.compareAtPrice/g, 'product.regularPrice');
content = content.replace(/product\.price/g, 'product.salePrice');

fs.writeFileSync('components/ProductCard.tsx', content);
