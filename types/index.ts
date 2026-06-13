export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  brand?: string;
  collection?: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  discountPercentage: number;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  material?: string;
  color?: string;
  size?: string;
  occasion?: string;
  careInstructions?: string;
  waterproof?: boolean;
  antiTarnish?: boolean;
  jewelleryType?: string;
  plating?: string;
  stoneType?: string;
  specifications?: Record<string, string> | string[];
  warranty?: string;
  returnPolicy?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isLimitedStock?: boolean;
  isFlashDeal?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
  thumbnail?: string;
  searchKeywords?: string[];
  variants?: any[];
  badges?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus =
  | "Pending Verification"
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

export type OrderTimelineEvent = {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPhoneClean?: string;
  shippingAddress: Address;
  address: Address; // Backwards compatibility fallback
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  shipping: number; // Backwards compatibility fallback
  discount: number;
  couponCode?: string;
  couponId?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Refunded" | "Failed";
  orderStatus: OrderStatus;
  status: OrderStatus; // Backwards compatibility fallback
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  timeline: OrderTimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "flat" | "percent" | "fixed" | "percentage";
  value: number;
  active: boolean;
  expiryDate?: string;
  minOrderValue?: number; // Backwards compatibility fallback
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate?: string;
  usageLimit?: number;
  usageCount?: number; // Backwards compatibility fallback
  usedCount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type SiteContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  footerText?: string;
  aboutText?: string;
  faqText?: string;
  returnPolicyText?: string;
  privacyPolicyText?: string;
  contactPageText?: string;
  promotionalText?: string;
};

export type BannerPlacement =
  | "hero"
  | "promo"
  | "sale"
  | "category"
  | "footer-promo"
  | "all";

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  link: string;
  placement: BannerPlacement;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  brandName: string;
  logoText: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  borderRadius?: string;
  fontStyle?: "serif" | "sans" | "mono";
  cardStyle?: "flat" | "rounded" | "glass";
  darkMode: boolean;
  announcementBarColor?: string;
  saleBadgeColor?: string;
};

export type HomepageSection = {
  id: string;
  title: string;
  type:
    | "flash-deals"
    | "trending"
    | "new-arrivals"
    | "best-sellers"
    | "category-grid"
    | "custom-category"
    | "budget"
    | "reviews"
    | "newsletter"
    | "social-proof";
  isActive: boolean;
  order: number;
  maxProducts: number;
  categoryFilter?: string;
  productIds?: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  bannerUrl?: string;
  subcategories: string[];
  priority: number;
  isActive: boolean;
};

export type SEOSettings = {
  homepageTitle?: string;
  homepageDescription?: string;
  categoryTitleTemplate?: string;
  categoryDescriptionTemplate?: string;
  productTitleTemplate?: string;
  productDescriptionTemplate?: string;
  ogImage?: string;
  socialText?: string;
};

export type AnnouncementSettings = {
  showAnnouncement: boolean;
  text: string;
  countdownTimer?: string;
  popupOfferTitle?: string;
  popupOfferText?: string;
  showNewsletterPopup: boolean;
  whatsAppSupport?: string;
  whatsAppMessage?: string;
  showWhatsAppButton?: boolean;
  announcementBarColor?: string;
  
  // New COD and Shipping configuration fields
  codEnabled?: boolean;
  codRiskWarningText?: string;
  shippingFee?: number;
  freeShippingThreshold?: number;
  allowedDeliveryStates?: string[];
  blockedDeliveryStates?: string[];
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isReplied?: boolean;
};

