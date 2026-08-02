import sys
file_path = 'components/ProductCard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. replace handleAddToCart
old_handle = '''  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (product.selectedSizeRequired || product.selectedColorRequired) {
      router.push(/product/\);
      return;
    }
    addToCart(product, 1);
    toast.success("Added to cart!");
  };'''

new_handle = '''  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (product.isBundle && product.bundleType === "mix_and_match") {
      router.push(/bundles/\);
      return;
    }
    if (product.selectedSizeRequired || product.selectedColorRequired) {
      router.push(/product/\);
      return;
    }
    addToCart(product, 1);
    toast.success("Added to cart!");
  };'''

content = content.replace(old_handle, new_handle)

# 2. Add productUrl and buttonText before return
old_return = '''    null;

  return ('''

new_return = '''    null;

  const productUrl = product.isBundle ? /bundles/\ : /product/\;
  const buttonText = (product.isBundle && product.bundleType === "mix_and_match") 
    ? "Build Bundle" 
    : (product.selectedSizeRequired || product.selectedColorRequired) 
      ? "Select Options" 
      : (product.isBundle ? "View Bundle" : "Add to Cart");

  return ('''

content = content.replace(old_return, new_return)

# 3. Replace the href in the first Link
old_link1 = '''      <Link
        href={/product/\}
        className="relative aspect-[4/5]'''

new_link1 = '''      <Link
        href={productUrl}
        className="relative aspect-[4/5]'''

content = content.replace(old_link1, new_link1)

# 4. Replace the href in the second Link
old_link2 = '''        <Link
          href={/product/\}
          className="line-clamp-2'''

new_link2 = '''        <Link
          href={productUrl}
          className="line-clamp-2'''

content = content.replace(old_link2, new_link2)

# 5. Replace Add to Cart text with buttonText
old_btn = '''          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </button>'''

new_btn = '''          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{buttonText}</span>
        </button>'''

content = content.replace(old_btn, new_btn)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
