'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, User, UserRole, SavedAddress, Order, SocialLinkConfig } from '@/types';

export const DEFAULT_SOCIAL_LINKS: SocialLinkConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب',
    url: 'https://wa.me/201060777895',
    enabled: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    url: 'https://facebook.com/hubcloud',
    enabled: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameAr: 'إنستجرام',
    url: 'https://instagram.com/hubcloud',
    enabled: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    nameAr: 'يوتيوب',
    url: 'https://youtube.com/@hubcloud',
    enabled: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    url: 'https://linkedin.com/company/hubcloud',
    enabled: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    url: 'https://tiktok.com/@hubcloud',
    enabled: true,
  },
];

interface StoreContextType {
  // Live Catalog from DB
  products: Product[];
  categories: Category[];
  isCatalogLoading: boolean;
  refreshCatalog: () => Promise<void>;

  // Language & Localization
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  isRtl: boolean;
  currency: 'EGP';
  formatPrice: (priceInEgp: number) => string;

  // User & Authentication
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, role?: UserRole, userObj?: User) => boolean;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { id?: string }) => boolean;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  savedAddresses: SavedAddress[];
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Orders Management & Sync
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'date'> & { id?: string }) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: { ram?: string; storage?: string; warranty?: string; variantId?: string; selectedOptions?: Record<string, any>; unitPrice?: number }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shipping: number;
  vat: number;
  discount: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Compare
  compareList: string[];
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  compareCount: number;

  // Search & Global
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;

  // Notification Toast
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Social Channels
  socialLinks: SocialLinkConfig[];
  updateSocialLinks: (links: SocialLinkConfig[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Module-level deduplication to eliminate duplicate network requests across components and StrictMode
let activeCatalogPromise: Promise<void> | null = null;
let lastCatalogFetchTime = 0;
let activeAuthPromise: Promise<void> | null = null;
let lastAuthFetchTime = 0;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const currency: 'EGP' = 'EGP';
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinkConfig[]>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hubcloud_social_links');
      if (saved) {
        setSocialLinks(JSON.parse(saved));
      } else {
        const storeSettings = localStorage.getItem('hubcloud_store_settings');
        if (storeSettings) {
          const parsed = JSON.parse(storeSettings);
          if (parsed.socialLinks && Array.isArray(parsed.socialLinks)) {
            setSocialLinks(parsed.socialLinks);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateSocialLinks = (links: SocialLinkConfig[]) => {
    setSocialLinks(links);
    try {
      localStorage.setItem('hubcloud_social_links', JSON.stringify(links));
      const storeSettings = localStorage.getItem('hubcloud_store_settings');
      const parsed = storeSettings ? JSON.parse(storeSettings) : {};
      parsed.socialLinks = links;
      localStorage.setItem('hubcloud_store_settings', JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  };

  // Live Catalog State from DB
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const refreshCatalog = async (force = false) => {
    const now = Date.now();
    if (!force && lastCatalogFetchTime > 0 && now - lastCatalogFetchTime < 15000) {
      return;
    }
    if (activeCatalogPromise) {
      return activeCatalogPromise;
    }

    activeCatalogPromise = (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        if (prodData.success && prodData.products) {
          setProducts(prodData.products);
          try { localStorage.setItem('hubcloud_cache_products', JSON.stringify(prodData.products)); } catch (e) {}
        }
        if (catData.success && catData.categories) {
          const cleanCats = catData.categories.filter((c: any) => !c.slug?.startsWith('test-cat-'));
          setCategories(cleanCats);
          try { localStorage.setItem('hubcloud_cache_categories', JSON.stringify(cleanCats)); } catch (e) {}
        }
        lastCatalogFetchTime = Date.now();
      } catch (err) {
        console.warn('Failed to load store catalog from DB:', err);
      } finally {
        setIsCatalogLoading(false);
        activeCatalogPromise = null;
      }
    })();

    return activeCatalogPromise;
  };

  // User & Auth State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize initial cart, catalog, and user data from localStorage and API
  useEffect(() => {
    // 0ms Instant Hydration from SWR Local Cache
    try {
      const cachedProds = localStorage.getItem('hubcloud_cache_products');
      const cachedCats = localStorage.getItem('hubcloud_cache_categories');
      if (cachedProds && cachedCats) {
        const p = JSON.parse(cachedProds);
        const c = JSON.parse(cachedCats).filter((cat: any) => !cat.slug?.startsWith('test-cat-'));
        if (Array.isArray(p) && p.length > 0 && Array.isArray(c) && c.length > 0) {
          setProducts(p);
          setCategories(c);
          setIsCatalogLoading(false);
        }
      }
    } catch (e) {}

    // Silent background revalidation (deduplicated)
    refreshCatalog();

    try {
      const savedLang = localStorage.getItem('hubcloud_lang') as 'en' | 'ar';
      if (savedLang) setLanguageState(savedLang);

      const savedUser = localStorage.getItem('hubcloud_user');
      let parsedUser: any = null;
      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
          setCurrentUserState(parsedUser);
          const userAddrKey = `hubcloud_addresses_${parsedUser.id}`;
          const savedAddrData = localStorage.getItem(userAddrKey);
          if (savedAddrData) {
            setSavedAddresses(JSON.parse(savedAddrData));
          } else {
            setSavedAddresses([]);
          }
        } catch (e) {}
      } else {
        setSavedAddresses([]);
      }

      // Re-validate session with server-side HTTP-only cookie (deduplicated)
      const nowTime = Date.now();
      if (!activeAuthPromise && nowTime - lastAuthFetchTime > 15000) {
        activeAuthPromise = fetch('/api/auth/me')
          .then(res => res.json())
          .then(data => {
            lastAuthFetchTime = Date.now();
            if (data.success && data.user) {
              setCurrentUserState(data.user);
              try { localStorage.setItem('hubcloud_user', JSON.stringify(data.user)); } catch (e) {}
            } else if (savedUser) {
              // Server session expired or invalid
              setCurrentUserState(null);
              try { localStorage.removeItem('hubcloud_user'); } catch (e) {}
              setSavedAddresses([]);
            }
          })
          .catch(() => {})
          .finally(() => {
            activeAuthPromise = null;
          });
      }

      const savedOrdersData = localStorage.getItem('hubcloud_orders');
      if (savedOrdersData) {
        try { setOrders(JSON.parse(savedOrdersData)); } catch (e) {}
      }

      // Only sync all database orders if the user has an administrative role
      if (parsedUser && parsedUser.role === 'admin') {
        fetch('/api/orders')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.orders && data.orders.length > 0) {
              setOrders(prev => {
                const map = new Map<string, Order>();
                data.orders.forEach((o: Order) => map.set(o.id, o));
                prev.forEach(o => { if (!map.has(o.id)) map.set(o.id, o); });
                return Array.from(map.values());
              });
            }
          })
          .catch(err => console.warn('Could not sync DB orders:', err));
      }

      const savedCart = localStorage.getItem('hubcloud_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) {}
      }

      const savedWishlist = localStorage.getItem('hubcloud_wishlist');
      if (savedWishlist) {
        try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
      }

      const savedCompare = localStorage.getItem('hubcloud_compare');
      if (savedCompare) {
        try { setCompareList(JSON.parse(savedCompare)); } catch (e) {}
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('hubcloud_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('hubcloud_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hubcloud_lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const formatPrice = (priceInEgp: number) => {
    const formatted = Math.round(priceInEgp || 0).toLocaleString('en-US');
    if (language === 'ar') {
      return `${formatted} ج.م`;
    }
    return `EGP ${formatted}`;
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    options?: { ram?: string; storage?: string; warranty?: string; variantId?: string; selectedOptions?: Record<string, any>; unitPrice?: number }
  ) => {
    const finalUnitPrice = options?.unitPrice || product.price;
    const itemKey = options?.variantId
      ? `${product.id}-${options.variantId}`
      : `${product.id}-${options?.ram || ''}-${options?.storage || ''}-${options?.warranty || ''}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * finalUnitPrice
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: itemKey,
            product,
            quantity,
            selectedRam: options?.ram,
            selectedStorage: options?.storage,
            selectedWarranty: options?.warranty,
            selectedVariantId: options?.variantId,
            selectedOptions: options?.selectedOptions,
            unitPrice: finalUnitPrice,
            totalPrice: quantity * finalUnitPrice
          }
        ];
      }
    });

    showToast(
      language === 'ar' ? `تمت إضافة "${product.nameAr || product.name}" إلى سلة المشتريات!` : `Added "${product.name}" to your cart!`,
      'success'
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast(language === 'ar' ? 'تم حذف المنتج من السلة' : 'Item removed from cart', 'info');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast(language === 'ar' ? 'تم إفراغ سلة المشتريات' : 'Cart cleared', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(language === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(language === 'ar' ? 'تمت الإزالة من المقارنة' : 'Removed from compare', 'info');
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          showToast(language === 'ar' ? 'يمكن مقارنة 4 منتجات كحد أقصى' : 'Max 4 products to compare', 'error');
          return prev;
        }
        showToast(language === 'ar' ? 'تمت الإضافة للمقارنة' : 'Added to compare', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInCompare = (productId: string) => compareList.includes(productId);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;

    try {
      const currentSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, subtotal: currentSubtotal }),
      });
      const data = await res.json();

      if (data.success && data.valid) {
        setAppliedCoupon(data.code);
        setDiscountAmount(data.discountAmount || 0);
        showToast(
          language === 'ar'
            ? `تم تطبيق كود الخصم بنجاح (-${(data.discountAmount || 0).toLocaleString('ar-EG')} ج.م)`
            : `Coupon applied successfully (-EGP ${(data.discountAmount || 0).toLocaleString('en-US')})`,
          'success'
        );
        return true;
      } else {
        showToast(
          language === 'ar'
            ? (data.message || 'كود الخصم غير صحيح أو منتهي')
            : (data.message || 'Invalid or expired coupon code'),
          'error'
        );
        return false;
      }
    } catch (err) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء فحص الكوبون' : 'Error checking coupon',
        'error'
      );
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showToast(language === 'ar' ? 'تم إلغاء كود الخصم' : 'Coupon removed', 'info');
  };

  // User & Auth Handlers
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      try {
        localStorage.setItem('hubcloud_user', JSON.stringify(user));
        const userAddrKey = `hubcloud_addresses_${user.id}`;
        const savedAddrData = localStorage.getItem(userAddrKey);
        setSavedAddresses(savedAddrData ? JSON.parse(savedAddrData) : []);
      } catch (e) {}
    } else {
      try { localStorage.removeItem('hubcloud_user'); } catch (e) {}
      setSavedAddresses([]);
    }
  };

  const login = (email: string, role: UserRole = 'customer', userObj?: User): boolean => {
    const userToSet: User = userObj || {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      phone: '01000000000',
      role: role,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(userToSet);
    showToast(language === 'ar' ? `مرحباً بك، ${userToSet.name}` : `Welcome, ${userToSet.name}`, 'success');
    return true;
  };

  const register = (userData: Omit<User, 'id' | 'createdAt'> & { id?: string }): boolean => {
    const newUser: User = {
      ...userData,
      id: userData.id || ('usr-' + Date.now()),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newUser);
    setSavedAddresses([]); // Brand new account always starts with 0 saved addresses!
    try {
      localStorage.setItem(`hubcloud_addresses_${newUser.id}`, JSON.stringify([]));
      // Ensure brand new registered users start with zero mock orders
      const userEmail = (newUser.email || '').toLowerCase().trim();
      setOrders(prev => {
        const cleaned = prev.filter(o => {
          const ordEmail = (o.customerEmail || '').toLowerCase().trim();
          return ordEmail && ordEmail !== userEmail;
        });
        try { localStorage.setItem('hubcloud_orders', JSON.stringify(cleaned)); } catch (e) {}
        return cleaned;
      });
    } catch (e) {}
    showToast(language === 'ar' ? 'تم إنشاء الحساب بنجاح، أهلاً بك في هاب كلاود!' : 'Account created successfully!', 'success');
    return true;
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
    setSavedAddresses([]);
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const next = { ...currentUser, ...updated };
    setCurrentUser(next);
    showToast(language === 'ar' ? 'تم تحديث بيانات الحساب بنجاح' : 'Profile updated successfully', 'success');
  };

  const addAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = { ...addr, id: 'addr-' + Date.now() };
    const next = [newAddr, ...savedAddresses];
    setSavedAddresses(next);
    try {
      const key = currentUser ? `hubcloud_addresses_${currentUser.id}` : 'hubcloud_addresses_guest';
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {}
    showToast(language === 'ar' ? 'تمت إضافة العنوان الجديد' : 'Address added successfully', 'success');
  };

  const removeAddress = (id: string) => {
    const next = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(next);
    try {
      const key = currentUser ? `hubcloud_addresses_${currentUser.id}` : 'hubcloud_addresses_guest';
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {}
    showToast(language === 'ar' ? 'تم حذف العنوان' : 'Address deleted', 'info');
  };

  const setDefaultAddress = (id: string) => {
    const next = savedAddresses.map(a => ({ ...a, isDefault: a.id === id }));
    setSavedAddresses(next);
    try {
      const key = currentUser ? `hubcloud_addresses_${currentUser.id}` : 'hubcloud_addresses_guest';
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {}
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'date'> & { id?: string }): Order => {
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || ('HC-' + Math.floor(100000 + Math.random() * 900000)),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    const next = [newOrder, ...orders];
    setOrders(next);
    try { localStorage.setItem('hubcloud_orders', JSON.stringify(next)); } catch (e) {}
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
    } catch (e) {
      console.warn('API update orderStatus failed:', e);
    }
    const next = orders.map(o => o.id === orderId ? { ...o, orderStatus: status } : o);
    setOrders(next);
    try { localStorage.setItem('hubcloud_orders', JSON.stringify(next)); } catch (e) {}
    showToast(language === 'ar' ? `تم تحديث حالة الطلب #${orderId}` : `Order #${orderId} status updated`, 'success');
  };

  const updatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
    } catch (e) {
      console.warn('API update paymentStatus failed:', e);
    }
    const next = orders.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o);
    setOrders(next);
    try { localStorage.setItem('hubcloud_orders', JSON.stringify(next)); } catch (e) {}
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const shipping = cart.length > 0 ? 75 : 0;
  const vat = 0;
  const discount = appliedCoupon ? discountAmount : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const isRtl = language === 'ar';

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        isCatalogLoading,
        refreshCatalog,
        language,
        setLanguage,
        isRtl,
        currency,
        formatPrice,
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        updateProfile,
        savedAddresses,
        addAddress,
        removeAddress,
        setDefaultAddress,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shipping,
        vat,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        compareList,
        toggleCompare,
        isInCompare,
        compareCount: compareList.length,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        toast,
        showToast,
        socialLinks,
        updateSocialLinks
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
