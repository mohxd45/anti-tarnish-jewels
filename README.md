# Anti Tarnish Jewel

A premium jewellery e-commerce website built with Next.js App Router, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Storage-ready structure, Stripe/Razorpay placeholder routes, cart, wishlist, checkout, account pages, and admin dashboard.

## Features

- Luxury black, champagne gold, rose pink theme
- Home page with hero, categories, best sellers, under-budget sections
- Product listing with search, filters, sorting
- Product details with add to cart, wishlist, buy now
- Cart with quantity update, coupon, shipping, free-shipping progress
- Wishlist with local persistence
- Firebase Authentication: email/password, Google login, forgot password
- Protected account, orders, wishlist, checkout
- Admin-only dashboard controlled by `NEXT_PUBLIC_ADMIN_EMAIL`
- Add product and manage product pages
- Checkout with COD working immediately
- Stripe and Razorpay placeholder API routes
- Contact form saved to Firestore
- Sample products included

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Add Firebase keys in `.env.local`.

4. Add your admin email:

```bash
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

5. Start dev server:

```bash
npm run dev
```

6. Open:

```bash
http://localhost:3000
```

## Firebase Setup

Create a Firebase project and enable:

- Authentication
  - Email/password
  - Google provider
- Firestore Database
- Storage

Firestore collections used:

- users
- products
- categories
- carts
- wishlists
- orders
- reviews
- coupons
- contactMessages
- recentlyViewed
- newsletterSubscribers

## Seed Sample Products

After Firebase keys are set, run:

```bash
npm run seed
```

## Payment Setup

Cash on Delivery works immediately.

For Stripe:
- Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Add `STRIPE_SECRET_KEY`
- Complete logic in `app/api/create-stripe-session/route.ts`

For Razorpay:
- Add `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Add `RAZORPAY_KEY_SECRET`
- Complete logic in `app/api/create-razorpay-order/route.ts`

## Firebase Security Rules Deployment

To deploy Firestore security rules, run:
```bash
firebase deploy --only firestore:rules
```

To deploy Storage security rules, run:
```bash
firebase deploy --only storage
```

## Cloudinary Image Optimization Setup

To enable Cloudinary dynamic optimization and fast client-side uploads:
1. Define the following in `.env.local` or Vercel Environment Variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (Make sure this is set to **unsigned** in Cloudinary settings)
2. Product image uploads and catalog graphics will automatically route to Cloudinary.

## Payment & Live Integration

COD (Cash on Delivery) checkout works immediately. For Stripe or Razorpay gateways, update the corresponding keys in `.env.local` and complete their respective route integrations.
