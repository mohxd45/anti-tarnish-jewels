const fs = require('fs');

let content = fs.readFileSync('lib/firestore.ts', 'utf8');

// The isMock references are pervasive and intertwined.
// Instead of complex regex, we'll redefine isMock = false statically at the top
// and rely on a build-time clean or just let the dead code sit for now since
// the user specifically needs this fixed immediately to stop the bug.

content = content.replace(/const isMock = !hasRealFirebase;/g, 'const isMock = false;');
content = content.replace(/import { db, storage, auth, hasRealFirebase } from "@\/lib\/firebase";/g, 'import { db, storage, auth } from "@/lib/firebase";');

fs.writeFileSync('lib/firestore.ts', content);
console.log('Done modifying firestore.ts');
