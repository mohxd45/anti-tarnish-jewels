import sys

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove `if (isMock) { ... }`
    while True:
        idx = content.find("if (isMock) {")
        if idx == -1:
            break
        brace_count = 0
        end_idx = -1
        for i in range(idx + 13, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                if brace_count == 0:
                    end_idx = i
                    break
                else:
                    brace_count -= 1
        
        if end_idx != -1:
            content = content[:idx] + content[end_idx+1:]
        else:
            break

    # 2. Simplify all catch blocks that have localStorage
    import re
    
    # We will find `catch (err) { ... }` blocks.
    # If a catch block contains `localStorage.setItem` or `localStorage.getItem` or `window !== "undefined"`,
    # we replace its contents with a simple console.error or throw.
    
    # Regex to find catch blocks
    catch_pattern = re.compile(r'catch\s*\(([^)]+)\)\s*\{')
    
    pos = 0
    while True:
        match = catch_pattern.search(content, pos)
        if not match:
            break
            
        start_idx = match.end() - 1 # The opening brace of catch block
        brace_count = 0
        end_idx = -1
        for i in range(start_idx + 1, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                if brace_count == 0:
                    end_idx = i
                    break
                else:
                    brace_count -= 1
                    
        if end_idx != -1:
            catch_body = content[start_idx+1:end_idx]
            if 'localStorage' in catch_body or 'isMock' in catch_body:
                # We want to replace it. Let's see what the function is.
                # If it's createOrder, addProduct, we might want to throw.
                # Actually, the user says "If Firestore write fails or times out -> show a clear error message to the customer".
                # For functions returning a promise, `throw err;` works nicely.
                
                # Let's extract the error variable name
                err_var = match.group(1)
                new_body = f'\n    console.error("Firestore operation failed:", {err_var});\n    throw {err_var};\n  '
                
                content = content[:start_idx+1] + new_body + content[end_idx:]
                pos = start_idx + len(new_body) + 1
            else:
                pos = end_idx + 1
        else:
            break

    # 3. Remove `const isMock = false;` or `const isMock = true;`
    content = re.sub(r'const isMock\s*=\s*(false|true);\s*', '', content)

    # 4. Remove `import { sampleProducts } from "@/data/products";`
    content = re.sub(r'import\s*\{\s*sampleProducts\s*\}\s*from\s*["\']@/data/products["\'];?\s*', '', content)
    
    # 5. Remove `sampleProducts` from fallback returns
    content = re.sub(r'\?\s*products\s*:\s*sampleProducts', '? products : []', content)
    content = re.sub(r'cachedProducts\s*=\s*sampleProducts;', 'cachedProducts = [];', content)
    content = re.sub(r'return\s*sampleProducts;', 'return [];', content)
    content = re.sub(r'\?\s*parsed\s*:\s*sampleProducts', '? parsed : []', content)
    content = re.sub(r'\|\s*sampleProducts', '| []', content)

    # 6. Remove `withTimeout` from `createOrder` and `addProduct` since user requested to remove the 5-sec wrapper
    # Let's just remove the withTimeout import and usage
    content = re.sub(r'withTimeout\(([^,]+),\s*\d+\)', r'\1', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('lib/firestore.ts')
