const fs = require('fs'); 
const files = ['app/admin/orders/page.tsx', 'app/admin/products/page.tsx', 'app/admin/categories/page.tsx', 'app/admin/coupons/page.tsx', 'app/admin/banners/page.tsx', 'app/admin/seo/page.tsx', 'app/admin/announcements/page.tsx', 'app/admin/settings/page.tsx', 'app/admin/login/page.tsx']; 
files.forEach(f => { 
  try { 
    const code = fs.readFileSync(f, 'utf8'); 
    const lines = code.split('\n'); 
    lines.forEach((line, i) => { 
      if (line.includes('\\${') || line.includes('\\`') || line.includes('Saving…')) {
        console.log(f + ':' + (i+1) + ' ' + line.trim()); 
      }
    }); 
  } catch (e) {} 
});
