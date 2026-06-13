const fs = require('fs');
const path = require('path');

const searchDir = "c:\\Users\\LG GRAM\\Downloads\\noore-jewels\\noore-jewels";
const dirsToSearch = ["app", "components"];

const patterns = [
    /\btext-white\b/
];

console.log("Scanning files for text-white in app (excluding admin) and components...");

function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
        if (currentPath.includes('app\\admin') || currentPath.includes('app/admin')) continue;
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css'))) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    for (const pattern of patterns) {
                        if (pattern.test(line)) {
                            const relPath = path.relative(searchDir, fullPath);
                            console.log(`${relPath}:${idx + 1}: ${line.trim()}`);
                            break;
                        }
                    }
                });
            } catch (err) {
                // Ignore read errors
            }
        }
    }
}

for (const dir of dirsToSearch) {
    const fullPath = path.join(searchDir, dir);
    if (fs.existsSync(fullPath)) {
        walkDir(fullPath);
    }
}
console.log("Scan complete.");
