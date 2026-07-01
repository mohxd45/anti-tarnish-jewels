const fs=require('fs');
const html=fs.readFileSync('C:\\Users\\LG GRAM\\Downloads\\noore-jewels\\anti-tarnish-jewels-latest-antigravity\\new_ui_extracted.html','utf8');
const header = html.split('<div id="page-')[0];
fs.writeFileSync('C:\\Users\\LG GRAM\\Downloads\\noore-jewels\\anti-tarnish-jewels-latest-antigravity\\scratch_header_css.html', header);
console.log('done');
