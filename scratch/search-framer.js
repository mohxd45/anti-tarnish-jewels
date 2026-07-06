const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const dirs = [path.join(__dirname, '../app'), path.join(__dirname, '../components')];
let allFiles = [];
dirs.forEach(d => allFiles = allFiles.concat(walk(d)));

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('framer-motion') || content.includes('components/three')) {
        console.log(file.split('anti-tarnish-jewels-latest-antigravity')[1]);
    }
});
