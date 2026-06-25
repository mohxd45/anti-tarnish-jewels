const fs = require('fs');

let content = fs.readFileSync('app/admin/add-product/page.tsx', 'utf8');

// Theme replacements
content = content.replace(/text-cream\/[0-9]+/g, 'text-stoneGray');
content = content.replace(/text-cream/g, 'text-charcoalBrown');
content = content.replace(/bg-noir\/[0-9]+/g, 'bg-beige');
content = content.replace(/bg-noir/g, 'bg-warmwhite');
content = content.replace(/text-gold/g, 'text-champagne');
content = content.replace(/border-gold\/[0-9]+/g, 'border-goldBeige');
content = content.replace(/bg-white\/\[0\.04\]/g, 'bg-warmwhite');
content = content.replace(/text-rose/g, 'text-dustyRose');
content = content.replace(/bg-gold/g, 'bg-champagne');

// Validation Logic Replace
const oldValidation = `    // Safe validation checks
    if (!name || !name.trim()) {
      setMessage("Product name is required.");
      return;
    }
    if (!category || !category.trim()) {
      setMessage("Category is required.");
      return;
    }
    if (salePrice === undefined || salePrice === null || Number(salePrice) <= 0) {
      setMessage("Sale price is required and must be greater than 0.");
      return;
    }
    if (stock === undefined || stock === null || Number(stock) < 0) {
      setMessage("Stock availability is required and cannot be negative.");
      return;
    }`;

const newValidation = `    // Safe validation checks
    if (!name || !name.trim()) {
      setMessage("Product name is required.");
      return;
    }
    if (!category || !category.trim()) {
      setMessage("Category is required.");
      return;
    }
    if (!description || !description.trim()) {
      setMessage("Product description is required.");
      return;
    }
    const parsedSale = Number(salePrice);
    const parsedReg = Number(regularPrice);
    
    if (
      (isNaN(parsedReg) || parsedReg <= 0) &&
      (isNaN(parsedSale) || parsedSale <= 0)
    ) {
      setMessage("Regular price or Sale price must be a valid positive number.");
      return;
    }
    if (stock === undefined || stock === null || Number(stock) < 0 || isNaN(Number(stock))) {
      setMessage("Stock availability is required and must be a valid number >= 0.");
      return;
    }`;

content = content.replace(oldValidation, newValidation);

const oldPayload = `const finalSalePrice = Number(salePrice);
      const finalRegularPrice = Number(regularPrice) || finalSalePrice;`;

const newPayload = `const finalSalePrice = isNaN(Number(salePrice)) ? 0 : Number(salePrice);
      const finalRegularPrice = isNaN(Number(regularPrice)) ? finalSalePrice : Number(regularPrice);`;

content = content.replace(oldPayload, newPayload);

fs.writeFileSync('app/admin/add-product/page.tsx', content);
console.log('Fixed app/admin/add-product/page.tsx');
