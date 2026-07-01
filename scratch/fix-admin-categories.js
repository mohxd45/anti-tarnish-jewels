const fs = require('fs');
const path = require('path');

function patchProductForm(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the productPayload assignment
  const targetObjStart = `const productPayload: Omit<Product, "id"> = {`;
  
  if (content.includes(targetObjStart)) {
    content = content.replace(targetObjStart, `const selectedCat = categories.find(c => c.slug === category || c.id === category);
      const catName = selectedCat ? selectedCat.name : category;
      
      const productPayload: Omit<Product, "id"> = {`);
      
    content = content.replace(`category: category.trim(),`, `category: catName.trim(),
        categoryId: category.trim(),
        categorySlug: category.trim(),`);
        
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${filePath}`);
  } else {
    console.log(`Could not find target in ${filePath}`);
  }
}

patchProductForm('app/admin/add-product/page.tsx');
patchProductForm('app/admin/products/[id]/page.tsx');
