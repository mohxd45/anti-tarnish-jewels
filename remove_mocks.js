const fs = require('fs');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Remove `if (isMock) { ... } else { ... }` or just `if (isMock) { ... }`
    while (true) {
        let idx = content.indexOf("if (isMock) {");
        if (idx === -1) {
            idx = content.indexOf("if (!isMock) {");
        }
        if (idx === -1) break;

        let isNegated = content.substring(idx, idx + 14) === "if (!isMock) {";

        let startIdx = content.indexOf("{", idx);
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            else if (content[i] === '}') {
                if (braceCount === 1) {
                    endIdx = i;
                    break;
                } else {
                    braceCount--;
                }
            }
        }

        if (endIdx !== -1) {
            // Check if there's an `else {` immediately after
            let afterBlock = content.substring(endIdx + 1);
            let elseMatch = afterBlock.match(/^\s*else\s*\{/);
            if (elseMatch) {
                let elseStartIdx = endIdx + 1 + elseMatch.index + elseMatch[0].length - 1;
                let elseBraceCount = 0;
                let elseEndIdx = -1;
                for (let i = elseStartIdx; i < content.length; i++) {
                    if (content[i] === '{') elseBraceCount++;
                    else if (content[i] === '}') {
                        if (elseBraceCount === 1) {
                            elseEndIdx = i;
                            break;
                        } else {
                            elseBraceCount--;
                        }
                    }
                }
                
                if (elseEndIdx !== -1) {
                    if (isNegated) {
                        // Keep the block, remove the else
                        let keepContent = content.substring(startIdx + 1, endIdx);
                        content = content.substring(0, idx) + keepContent + content.substring(elseEndIdx + 1);
                    } else {
                        // Remove the block, keep the else
                        let keepContent = content.substring(elseStartIdx + 1, elseEndIdx);
                        content = content.substring(0, idx) + keepContent + content.substring(elseEndIdx + 1);
                    }
                }
            } else {
                if (isNegated) {
                    // Keep the content
                    let keepContent = content.substring(startIdx + 1, endIdx);
                    content = content.substring(0, idx) + keepContent + content.substring(endIdx + 1);
                } else {
                    // Remove the content
                    content = content.substring(0, idx) + content.substring(endIdx + 1);
                }
            }
        } else {
            break;
        }
    }

    // 2. Simplify catch blocks
    let catchRegex = /catch\s*\(([^)]+)\)\s*\{/g;
    let pos = 0;
    while (true) {
        catchRegex.lastIndex = pos;
        let match = catchRegex.exec(content);
        if (!match) break;

        let startIdx = match.index + match[0].length - 1; // Opening brace
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx + 1; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            else if (content[i] === '}') {
                if (braceCount === 0) {
                    endIdx = i;
                    break;
                } else {
                    braceCount--;
                }
            }
        }

        if (endIdx !== -1) {
            let catchBody = content.substring(startIdx + 1, endIdx);
            if (catchBody.includes('localStorage') || catchBody.includes('isMock')) {
                let errVar = match[1];
                let newBody = `\n    console.error("Firestore operation failed:", ${errVar});\n    throw ${errVar};\n  `;
                content = content.substring(0, startIdx + 1) + newBody + content.substring(endIdx);
                pos = startIdx + newBody.length + 1;
            } else {
                pos = endIdx + 1;
            }
        } else {
            break;
        }
    }

    // 3. Remove `const isMock`
    content = content.replace(/const isMock\s*=\s*(false|true);\s*/g, '');

    // 4. Remove `sampleProducts`
    content = content.replace(/import\s*\{\s*sampleProducts\s*\}\s*from\s*["']@\/data\/products["'];?\s*/g, '');
    content = content.replace(/\?\s*products\s*:\s*sampleProducts/g, '? products : []');
    content = content.replace(/cachedProducts\s*=\s*sampleProducts;/g, 'cachedProducts = [];');
    content = content.replace(/return\s*sampleProducts;/g, 'return [];');
    content = content.replace(/\?\s*parsed\s*:\s*sampleProducts/g, '? parsed : []');
    content = content.replace(/\|\s*sampleProducts/g, '| []');

    // 5. Remove `withTimeout` usage with 5000ms
    content = content.replace(/withTimeout\(([\s\S]+?),\s*5000\)/g, '$1');

    fs.writeFileSync(filePath, content, 'utf-8');
}

processFile('lib/firestore.ts');
processFile('context/AuthContext.tsx');
console.log('done');
