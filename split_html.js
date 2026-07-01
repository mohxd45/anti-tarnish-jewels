const fs=require('fs'); 
const html=fs.readFileSync('C:\\Users\\LG GRAM\\Downloads\\noore-jewels\\anti-tarnish-jewels-latest-antigravity\\new_ui_extracted.html','utf8'); 
const sections = html.split('<div id="page-'); 
sections.slice(1).forEach(s => { 
  const name = s.split('"')[0]; 
  fs.writeFileSync('C:\\Users\\LG GRAM\\Downloads\\noore-jewels\\anti-tarnish-jewels-latest-antigravity\\scratch_'+name+'.html', '<div id="page-'+s); 
});
console.log('done');
