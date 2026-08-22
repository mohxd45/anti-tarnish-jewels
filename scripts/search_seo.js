const fs = require('fs');
const path = require('path');

const targetPatterns = [
  /vercel\.app/i,
  /anti-tarnish-jewels/i,
  /noore-jewels/i,
  /localhost/i,
  /metadataBase/i,
  /NEXT_PUBLIC_SITE_URL/i,
  /canonical/i,
  /SITE_URL/i
];

const excludeDirs = ['node_modules', '.next', '.git', '.vercel'];
const includeExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.env.local', '.env.production', '.env.example'];

const results = [];

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        searchFiles(filePath);
      }
    } else {
      const ext = path.extname(file);
      const isEnv = file.startsWith('.env');
      if (includeExts.includes(ext) || isEnv) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (targetPatterns.some(p => p.test(line))) {
            results.push({ file: filePath, line: index + 1, content: line.trim() });
          }
        });
      }
    }
  }
}

searchFiles('.');
fs.writeFileSync('search_results2.json', JSON.stringify(results, null, 2));
console.log('Search complete. Found ' + results.length + ' matches.');
