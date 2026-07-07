export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string;
  categorySlug?: string;
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
  colors?: string[];
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
  tags?: string[];
  badges?: string[];
  faqs?: { question: string; answer: string; }[];
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
  heroSmallTitle?: string;
  heroTitle?: string;
  heroMainHeading?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  footerText?: string;
  aboutText?: string;
  faqText?: string;
  returnPolicyText?: string;
  privacyPolicyText?: string;
  contactPageText?: string;
  promotionalText?: string;
  homepageSectionTitles?: {
    trending?: string;
    newArrivals?: string;
    bestSellers?: string;
    categories?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
  };
};

export type BannerPlacement =
  | "hero-banner"
  | "hero-floating-card"
  | "homepage-banner"
  | "category-banner";

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string; // Legacy
  ctaText?: string;
  link: string; // Legacy / Backward compat
  linkUrl?: string;
  linkType?: "category" | "product" | "custom-url" | "offer-page";
  slug?: string;
  categorySlug?: string;
  productSlug?: string;
  pageTitle?: string;
  pageDescription?: string;
  offerDetails?: string;
  terms?: string;
  placement: BannerPlacement;
  isActive?: boolean;
  active?: boolean;
  priority?: number; // Legacy
  order?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  brandName: string;
  subtitle?: string;
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  whatsAppNumber?: string;
  email?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  footerDescription?: string;
  businessAddress?: string;
  trustBadgeText?: string;
  
  // Delivery Settings
  freeDeliveryAmount?: number;
  freeShippingThreshold?: number;
  deliveryText?: string;
  deliveryFee?: number;
  shippingFee?: number;
  codEnabled?: boolean;
  codText?: string;
  checkoutNote?: string;

  // Theme Settings
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
  description?: string;
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
  cardStyle?: "flat" | "rounded" | "glass";
  text: string;
  countdownTimer?: string;
  popupOfferTitle?: string;
  popupOfferText?: string;
  popupOfferLinkText?: string;
  popupOfferLinkUrl?: string;
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



export type Announcement = {
  id: string;
  text: string;
  couponCode?: string;
  link?: string;
  emoji?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
};


export type UserRole = "owner_admin" | "partner_admin" | "developer_admin" | "staff" | "customer";
export type UserStatus = "active" | "suspended" | "banned";

export type AuditLog = {
  id: string;
  actorUid: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  section: string;
  documentChanged: string;
  oldValue?: string;
  newValue?: string;
  createdAt: any; // Timestamp or ISO string
};

export type StaffInvite = {
  email: string;
  role: UserRole;
  addedBy: string;
  createdAt: any;
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: string[];
  dateJoined?: string;
  lastLoginAt?: string;
  updatedAt?: string;
};



export type Review = {
  id: string;
  productId: string;
  userId?: string;
  customerName: string;
  rating: number;
  comment: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
};

export type ReturnRequest = {
  id: string;
  orderNumber: string;
  orderId?: string;
  customerEmail: string;
  customerPhone?: string;
  requestType: "Return" | "Exchange";
  reason: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
};
