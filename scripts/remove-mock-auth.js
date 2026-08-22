const fs = require('fs');

let content = fs.readFileSync('context/AuthContext.tsx', 'utf8');

// Replace isMock declaration
content = content.replace(/const isMock = !hasRealFirebase;/g, 'const isMock = false;');
content = content.replace(/const isMock = !hasRealFirebase;\s*/g, 'const isMock = false;\n');

fs.writeFileSync('context/AuthContext.tsx', content);
console.log('Done modifying AuthContext.tsx');
