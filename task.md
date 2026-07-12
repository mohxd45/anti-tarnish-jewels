# Current Tasks

- [x] Fix `status` property on `Product` in `app/shop/page.tsx`
- [x] Fix missing `description` property on `Category` in `types/index.ts`
- [x] Fix price properties on `Product` in `app/shop/page.tsx` (`compareAtPrice`/`price` -> `regularPrice`/`salePrice`)
- [x] Fix `name` and `price` properties in `app/track-order/page.tsx` (`item.name`/`item.price` -> `item.product.name`/`item.product.salePrice`)
- [x] Fix `cart` property in `CartContextType` (`cart` -> `items: cart` in `components/Header.tsx` and `components/MobileNav.tsx`)
- [x] Fix `filter` missing on `AnnouncementSettings` in `components/AnnouncementBar.tsx`)
- [x] Fix `addItem` missing on `WishlistContextType` in `components/ProductCard.tsx` and `components/ProductDetailsClient.tsx`)
- [x] Fix `tag` property on `Product` in `components/ProductCard.tsx`)
- [x] Run `npm run build` and ensure complete success with no errors
- [x] Phase 2 Security: Secure Checkout & Coupon Validation Backend
  - [x] Implement backend validation API Route (`/api/checkout`)
  - [x] Use `firebase-admin` for securely interacting with Firestore
  - [x] Fetch product prices on backend
  - [x] Validate coupons on backend
  - [x] Secure Firestore rules for `orders` and `coupons`
