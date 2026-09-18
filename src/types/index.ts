export type AttributeType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'color'
  | 'unit_number';

export interface AttributeGroup {
  id: string;
  name: string;
  nameAr: string;
  displayOrder: number;
  attributes?: Attribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Attribute {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  type: AttributeType;
  unit?: string | null;
  options?: string[] | null; // Parsed from JSON in API
  groupId: string;
  group?: AttributeGroup;
  categoryAssignments?: CategoryAttribute[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  category?: Category;
  attributeId: string;
  attribute?: Attribute;
  isRequired: boolean;
  displayOrder: number;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVisibleOnProductPage: boolean;
  isVariantOption: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  attribute?: Attribute;
  textValue?: string | null;
  numberValue?: number | null;
  booleanValue?: boolean | null;
  jsonValue?: any;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  price: number;
  oldPrice?: number | null;
  costPrice?: number | null;
  stockCount: number;
  image?: string | null;
  status: 'active' | 'inactive';
  options: Record<string, string>; // e.g. {"RAM": "32 GB", "Color": "Black"}
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  variantId?: string | null;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  category: string;
  categorySlug: string;
  subCategory?: string;
  sku: string;
  barcode?: string;
  price: number;
  oldPrice?: number;
  costPrice?: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  inStock: boolean;
  stockCount: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  shipsWithin: string;
  shipsWithinAr: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isDeal?: boolean;
  dealEndsIn?: string;
  status?: 'active' | 'draft' | 'scheduled' | 'archived';
  weight?: number;
  images: string[];
  thumbnail: string;
  description: string;
  descriptionAr: string;
  specs: Record<string, string>;
  specsAr?: Record<string, string>;
  features?: string[];
  featuresAr?: string[];
  ramOptions?: { label: string; priceDelta: number }[];
  storageOptions?: { label: string; priceDelta: number }[];
  warrantyOptions?: { label: string; priceDelta: number }[];
  variants?: ProductVariant[];
  attributeValues?: ProductAttributeValue[];
  seoTitle?: string;
  metaDescription?: string;
  searchKeywords?: string;
  isArchived?: boolean;
  monthlyInstallment?: {
    valuPrice: number;
    amanPrice: number;
    months: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedRam?: string;
  selectedStorage?: string;
  selectedWarranty?: string;
  selectedVariantId?: string;
  selectedOptions?: Record<string, any>;
  unitPrice: number;
  totalPrice: number;
  productId?: string;
  productName?: string;
  productNameAr?: string;
  productImage?: string;
}

// Single-Level Category Definition
export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  itemCount: number;
  image: string;
  banner?: string;
  iconName?: string;
  description?: string;
  descriptionAr?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isArchived?: boolean;
  assignedAttributes?: CategoryAttribute[];
  subCategories?: { name: string; nameAr: string; count: number; slug: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vat?: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cash_on_delivery';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export type UserRole = 'customer' | 'admin';

export type AdminPermission =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'categories'
  | 'attributes'
  | 'inventory'
  | 'coupons'
  | 'audit_logs'
  | 'pages'
  | 'settings'
  | 'roles';

export interface AdminRoleDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  permissions: AdminPermission[];
  isManager?: boolean;
}

export interface SavedAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  addressDetails: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  adminRoleId?: string;
  permissions?: AdminPermission[];
  isManager?: boolean;
  avatar?: string;
  createdAt: string;
}

export interface AdminKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  outOfStockCount: number;
  revenueGrowthPercentage: number;
}

export interface SocialLinkConfig {
  id: 'whatsapp' | 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok';
  name: string;
  nameAr: string;
  url: string;
  enabled: boolean;
}

export interface StoreSettings {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  showroomAddress: string;
  commercialRegistry: string;
  officialWarrantyPartner: string;
  workingHours: string;
  freeShippingThreshold: number;
  standardDeliveryFee: number;
  dispatchCutoff: string;
  socialLinks: SocialLinkConfig[];
}
