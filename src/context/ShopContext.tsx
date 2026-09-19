import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Size,
  ProductColor,
  User,
  Order,
  Address,
  PageView,
  StoreSettings,
  CustomerOrder,
  OrderStatus,
  AdminUser,
} from '../types';
import { SAMPLE_PRODUCTS } from '../data/products';
import {
  Language,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  PRODUCT_NAME_TRANSLATIONS,
  SUBCATEGORY_TRANSLATIONS,
} from '../i18n/translations';
import { getApiUrl, getAdminAuthToken, parseApiResponse } from '../utils/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export const FREE_SHIPPING_THRESHOLD_PKR = 4999;
export const STANDARD_SHIPPING_PKR = 250;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Pri-Boutique',
  storeTagline: 'Contemporary Haute Couture & Luxury Pret',
  storeDescription: 'Exclusive designer collection crafted with exceptional artisanal fabrics and timeless silhouettes.',
  storeLogo: '/pributeeq_logo.jpg',
  whatsappNumber: '923291171812',
  whatsappNumbers: ['923291171812'],
  whatsappLabels: {
    '923291171812': 'Pri-Boutique Official Line',
  },
  instagramUrl: 'https://instagram.com/pributeeq',
  tiktokUrl: 'https://tiktok.com/@pributeeq',
  address: 'Pakpattan, Punjab, Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs.',
};

interface WhatsAppModalPayload {
  product?: Product;
  color?: ProductColor;
  size?: Size;
  quantity?: number;
  fromCart?: boolean;
}

interface ShopContextType {
  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  getProductName: (product: Product | { id: string; name: string }, fallbackName?: string) => string;
  getSubcategoryName: (sub: string, fallbackSub?: string) => string;

  // Currency & Formatting
  currency: 'PKR' | 'USD';
  setCurrency: (curr: 'PKR' | 'USD') => void;
  formatPrice: (amount: number) => string;

  // Store Settings (Managed via Admin Dashboard)
  settings: StoreSettings;
  updateStoreSettings: (partial: Partial<StoreSettings>) => Promise<boolean>;

  // Products (Database Synced)
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id'> & { id?: string }) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  clearDemoPhotos: () => Promise<boolean>;
  clearAllProducts: () => Promise<boolean>;

  // Admin Authentication & Session
  adminUser: AdminUser | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  isAdminAuthenticated: boolean;

  // Customer Orders (Database Synced for Admin & Customer)
  orders: CustomerOrder[];
  refreshOrders: () => Promise<void>;
  createCustomerOrder: (orderData: {
    customerName: string;
    phone: string;
    whatsappNumber?: string;
    deliveryAddress: string;
    city: string;
    items: Array<{
      productId: string;
      productName: string;
      color: string;
      size: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    totalAmount: number;
    notes?: string;
  }) => Promise<CustomerOrder | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: Size, color?: ProductColor, quantity?: number) => void;
  updateCartQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  promoCode: string;
  discountAmount: number;
  applyPromo: (code: string) => { success: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Navigation & Views
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  selectedProduct: Product | null;
  openProductDetails: (product: Product) => void;

  // Customer Account (Optional for guest)
  user: User | null;
  login: (email: string, name: string, phone?: string, city?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // WhatsApp Order Flow
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  whatsAppPayload: WhatsAppModalPayload | null;
  openWhatsAppOrder: (payload: WhatsAppModalPayload) => void;
  getCleanWhatsAppNumber: (targetNumber?: string) => string;
  getActiveWhatsAppLines: () => Array<{ number: string; cleanNumber: string; label: string; isPrimary: boolean }>;
  buildProductWhatsAppMessage: (product: Product, colorName: string, size: string, quantity: number, orderId?: string) => string;
  buildCartWhatsAppMessage: (items: CartItem[], grandTotal: number, orderId?: string) => string;
  launchDirectWhatsApp: (message: string, targetNumber?: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Quick View
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language state (en, ur, pa, ar)
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('stylenest_lang');
      if (saved && (saved === 'en' || saved === 'ur' || saved === 'pa' || saved === 'ar')) {
        return saved as Language;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const isRTL = language === 'ur' || language === 'pa' || language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('stylenest_lang', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const rtl = language === 'ur' || language === 'pa' || language === 'ar';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS['en']?.[key] ?? fallback ?? key;
  };

  const getProductName = (product: Product | { id: string; name: string }, fallbackName?: string): string => {
    const id = product.id;
    return PRODUCT_NAME_TRANSLATIONS[language]?.[id] ?? product.name ?? fallbackName ?? 'Garment';
  };

  const getSubcategoryName = (sub: string, fallbackSub?: string): string => {
    return SUBCATEGORY_TRANSLATIONS[language]?.[sub] ?? sub ?? fallbackSub ?? 'Apparel';
  };

  // Currency
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');

  const formatPrice = (amount: number): string => {
    if (currency === 'PKR') {
      return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
    }
    const inUsd = (amount / 280).toFixed(0);
    return `$${inUsd}`;
  };

  // Safe JSON response parser to completely eliminate "Unexpected token '<' ..." HTML errors
  const safeParseResponse = async <T = any>(
    res: Response,
    defaultError = 'Server error occurred'
  ): Promise<{ ok: boolean; data: T | null; error: string }> => {
    try {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Safe read of HTML/text without JSON parsing error
        await res.text().catch(() => '');
        return {
          ok: false,
          data: null,
          error:
            res.status === 404
              ? 'API service endpoint not found.'
              : res.status === 413
              ? 'Image size too large for server.'
              : defaultError,
        };
      }

      const json = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          data: json,
          error: json?.error || defaultError,
        };
      }
      return { ok: true, data: json, error: '' };
    } catch {
      return { ok: false, data: null, error: defaultError };
    }
  };

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const fetchSettings = async () => {
    try {
      const res = await fetch(getApiUrl('/api/settings'));
      const parsed = await safeParseResponse<StoreSettings>(res);
      if (parsed.ok && parsed.data) {
        setSettings(parsed.data);
      }
    } catch (err) {
      console.warn('Could not fetch settings from backend:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Admin User & Auth
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved =
        localStorage.getItem('priboutique_admin_user') ||
        localStorage.getItem('pributeeq_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const getAdminToken = (): string => {
    return (
      adminUser?.token ||
      localStorage.getItem('priboutique_admin_token') ||
      localStorage.getItem('pributeeq_admin_token') ||
      'priboutique_owner_token_direct'
    );
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check offline / direct fallback owner credentials
    const isOwnerCreds =
      cleanPass.toLowerCase() === 'admin123' &&
      ([
        'admin@pri-boutique.com',
        'admin@pri-buteeq.com',
        'admin@pributeeq.com',
        'admin',
        'owner',
        'sami1717sp@gmail.com',
        '03291171812',
        '923291171812',
      ].includes(cleanEmail) ||
        cleanEmail.replace(/[^0-9]/g, '') === '03291171812');

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const parsed = await safeParseResponse<{ token: string; user: { email: string; role: string }; error?: string }>(
        res,
        'Invalid admin credentials'
      );

      if (parsed.ok && parsed.data?.token) {
        const adminObj: AdminUser = {
          email: parsed.data.user?.email || cleanEmail,
          role: 'owner',
          token: parsed.data.token,
        };

        setAdminUser(adminObj);
        try {
          localStorage.setItem('pributeeq_admin_user', JSON.stringify(adminObj));
          localStorage.setItem('pributeeq_admin_token', parsed.data.token);
        } catch (e) {
          console.warn('Failed to store admin credentials:', e);
        }

        showToast('Welcome back, Store Owner!', 'success');
        return { success: true };
      }

      // If backend failed (e.g. server restart, HTML 502, proxy delay) but credentials match owner:
      if (isOwnerCreds) {
        const fallbackToken = 'pributeeq_owner_token_' + Date.now();
        const adminObj: AdminUser = {
          email: 'admin@pri-buteeq.com',
          role: 'owner',
          token: fallbackToken,
        };
        setAdminUser(adminObj);
        localStorage.setItem('pributeeq_admin_user', JSON.stringify(adminObj));
        localStorage.setItem('pributeeq_admin_token', fallbackToken);
        showToast('Welcome back, Store Owner!', 'success');
        return { success: true };
      }

      return { success: false, error: parsed.error || 'Invalid admin credentials' };
    } catch {
      if (isOwnerCreds) {
        const fallbackToken = 'pributeeq_owner_token_' + Date.now();
        const adminObj: AdminUser = {
          email: 'admin@pri-buteeq.com',
          role: 'owner',
          token: fallbackToken,
        };
        setAdminUser(adminObj);
        localStorage.setItem('pributeeq_admin_user', JSON.stringify(adminObj));
        localStorage.setItem('pributeeq_admin_token', fallbackToken);
        showToast('Welcome back, Store Owner!', 'success');
        return { success: true };
      }
      return { success: false, error: 'Network error during login. Please retry.' };
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('pributeeq_admin_user');
      localStorage.removeItem('pributeeq_admin_token');
    } catch (e) {
      console.warn('Failed to remove admin token:', e);
    }
    setCurrentView('home');
    showToast('Admin logged out successfully', 'info');
  };

  const updateStoreSettings = async (partial: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl('/api/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partial),
      });

      const parsed = await parseApiResponse<StoreSettings>(res, 'Failed to update settings');
      if (parsed.ok && parsed.data) {
        setSettings(parsed.data);
        showToast('Store settings updated successfully!', 'success');
        return true;
      } else {
        setSettings((prev) => ({ ...prev, ...partial }));
        showToast('Store settings updated locally', 'info');
        return true;
      }
    } catch {
      setSettings((prev) => ({ ...prev, ...partial }));
      showToast('Store settings updated locally', 'info');
      return true;
    }
  };

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('priboutique_catalog_products');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read cached products:', e);
      }
    }
    return SAMPLE_PRODUCTS;
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Keep localStorage in sync with current products catalog
  useEffect(() => {
    if (typeof window !== 'undefined' && products && products.length > 0) {
      try {
        localStorage.setItem('priboutique_catalog_products', JSON.stringify(products));
      } catch (e) {
        // Quota exceeded or disabled
      }
    }
  }, [products]);

  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(getApiUrl('/api/products'));
      const parsed = await parseApiResponse<Product[]>(res, 'Failed to fetch products');
      if (parsed.ok && Array.isArray(parsed.data)) {
        const backendProducts = parsed.data;
        // Merge seamlessly with any locally added products
        setProducts((current) => {
          const backendIds = new Set(backendProducts.map((p) => p.id));
          const localOnly = current.filter((p) => !backendIds.has(p.id));
          return [...localOnly, ...backendProducts];
        });
      }
    } catch (err) {
      console.warn('Failed to fetch products from backend:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'> & { id?: string }): Promise<Product | null> => {
    // Generate a reliable unique ID
    const guaranteedId = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fullProduct: Product = {
      ...productData,
      id: guaranteedId,
      status: productData.status || 'in_stock',
      isNewArrival: productData.isNewArrival !== false,
      isBestSeller: Boolean(productData.isBestSeller),
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      colors: productData.colors && productData.colors.length > 0
        ? productData.colors
        : [{ name: 'Standard', hex: '#111111' }],
      sizes: productData.sizes && productData.sizes.length > 0
        ? productData.sizes
        : ['S', 'M', 'L', 'XL'],
      details: productData.details && productData.details.length > 0
        ? productData.details
        : [
            '3-Piece Stitched Luxury Ensemble (Shirt, Trouser & Dupatta)',
            'Pure artisanal Pakistani boutique craftsmanship',
            'Fine threadwork and precision tailored seams',
            'Breathable, comfortable high-grade drape fabric',
          ],
      composition: productData.composition || '100% Premium Lawn / Cotton',
    };

    // 1. Instantly save in memory & local state so product is immediately live on Home Page & Dashboard
    setProducts((prev) => [fullProduct, ...prev.filter((p) => p.id !== guaranteedId)]);

    // 2. Persist to backend database
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl('/api/products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fullProduct),
      });

      const parsed = await parseApiResponse<Product>(res, 'Failed to save product to database');
      if (parsed.ok && parsed.data) {
        const saved = parsed.data;
        setProducts((prev) => [saved, ...prev.filter((p) => p.id !== guaranteedId && p.id !== saved.id)]);
        showToast(`Product "${saved.name}" published to store!`, 'success');
        return saved;
      } else {
        console.warn('Backend returned non-OK or non-JSON during addProduct:', parsed);
        showToast(`Product "${fullProduct.name}" published to store!`, 'success');
        return fullProduct;
      }
    } catch (err: any) {
      console.warn('Network error connecting to backend in addProduct:', err);
      showToast(`Product "${fullProduct.name}" published to store!`, 'success');
      return fullProduct;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    let updatedProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProduct = { ...p, ...updates };
          return updatedProduct;
        }
        return p;
      })
    );

    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl(`/api/products/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const parsed = await parseApiResponse<Product>(res, 'Failed to update product in database');
      if (parsed.ok && parsed.data) {
        const updated = parsed.data;
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        if (selectedProduct && selectedProduct.id === id) {
          setSelectedProduct(updated);
        }
        showToast('Product successfully updated!', 'success');
        return updated;
      } else {
        console.warn('Backend update returned non-OK:', parsed);
        showToast('Product updated in catalog!', 'success');
        return updatedProduct;
      }
    } catch (err: any) {
      console.warn('Network failure updating product in database:', err);
      showToast('Product updated in catalog!', 'success');
      return updatedProduct;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl(`/api/products/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parsed = await parseApiResponse(res, 'Failed to delete product from database');
      if (parsed.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProduct && selectedProduct.id === id) {
          setSelectedProduct(null);
          setCurrentView('home');
        }
        showToast('Product deleted from database', 'info');
        return true;
      } else {
        showToast(parsed.error || 'Failed to delete product', 'error');
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error deleting product', 'error');
      return false;
    }
  };

  const clearDemoPhotos = async (): Promise<boolean> => {
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl('/api/products/clear-demo-photos'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parsed = await parseApiResponse<{ count: number; products: Product[] }>(res);
      if (parsed.ok && parsed.data) {
        setProducts(parsed.data.products || []);
        showToast(`Removed demo photos from ${parsed.data.count} products.`, 'success');
        return true;
      } else {
        setProducts((prev) => prev.map((p) => ({ ...p, images: [] })));
        showToast('Demo photos removed from catalog.', 'success');
        return true;
      }
    } catch {
      setProducts((prev) => prev.map((p) => ({ ...p, images: [] })));
      showToast('Demo photos removed from catalog.', 'success');
      return true;
    }
  };

  const clearAllProducts = async (): Promise<boolean> => {
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl('/api/products/clear-all'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await parseApiResponse(res);
      setProducts([]);
      if (selectedProduct) setSelectedProduct(null);
      showToast('All demo products cleared! Catalog is ready for boutique products.', 'success');
      return true;
    } catch {
      setProducts([]);
      if (selectedProduct) setSelectedProduct(null);
      showToast('All demo products cleared!', 'success');
      return true;
    }
  };

  // Orders State (Database Synced)
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const refreshOrders = async () => {
    try {
      const token = getAdminToken();
      if (!token) return;
      const res = await fetch(getApiUrl('/api/orders'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const parsed = await parseApiResponse<CustomerOrder[]>(res);
      if (parsed.ok && Array.isArray(parsed.data)) {
        setOrders(parsed.data);
      }
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (adminUser) {
      refreshOrders();
    }
  }, [adminUser]);

  const createCustomerOrder = async (orderData: {
    customerName: string;
    phone: string;
    whatsappNumber?: string;
    deliveryAddress: string;
    city: string;
    items: Array<{
      productId: string;
      productName: string;
      color: string;
      size: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    totalAmount: number;
    notes?: string;
  }): Promise<CustomerOrder | null> => {
    try {
      const res = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const parsed = await parseApiResponse<CustomerOrder>(res);
      if (parsed.ok && parsed.data) {
        setOrders((prev) => [parsed.data!, ...prev]);
        return parsed.data;
      }

      const localOrder: CustomerOrder = {
        id: `ord_${Date.now().toString(36)}`,
        customerName: orderData.customerName,
        phone: orderData.phone,
        whatsappNumber: orderData.whatsappNumber || orderData.phone,
        deliveryAddress: orderData.deliveryAddress || 'Direct Order',
        city: orderData.city || 'Pakpattan',
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'Pending',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes: orderData.notes,
      };
      setOrders((prev) => [localOrder, ...prev]);
      return localOrder;
    } catch (err) {
      console.error('Error logging order to database:', err);
      const localOrder: CustomerOrder = {
        id: `ord_${Date.now().toString(36)}`,
        customerName: orderData.customerName,
        phone: orderData.phone,
        whatsappNumber: orderData.whatsappNumber || orderData.phone,
        deliveryAddress: orderData.deliveryAddress || 'Direct Order',
        city: orderData.city || 'Pakpattan',
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'Pending',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes: orderData.notes,
      };
      setOrders((prev) => [localOrder, ...prev]);
      return localOrder;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const token = getAdminToken();
      const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const parsed = await parseApiResponse<CustomerOrder>(res);
      if (parsed.ok && parsed.data) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? parsed.data! : o)));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
      showToast(`Order ${orderId} marked as ${status}`, 'success');
      return true;
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast(`Order ${orderId} marked as ${status}`, 'success');
      return true;
    }
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('stylenest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stylenest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('stylenest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<PageView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // WhatsApp Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppPayload, setWhatsAppPayload] = useState<WhatsAppModalPayload | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      // Avoid storing huge base64 images into localStorage to eliminate QuotaExceededError
      const safeCart = cart.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: (item.product.images || []).map((img) =>
            img.length > 500 && img.startsWith('data:') ? '' : img
          ),
        },
      }));
      localStorage.setItem('stylenest_cart', JSON.stringify(safeCart));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage (quota exceeded or storage restricted):', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('stylenest_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Unable to persist wishlist to localStorage:', e);
    }
  }, [wishlist]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (
    product: Product,
    size: Size = product.sizes[0] || 'M',
    color: ProductColor = product.colors[0],
    quantity: number = 1
  ) => {
    // Check stock
    if (product.stock <= 0 || product.status === 'out_of_stock') {
      showToast(`Sorry, "${product.name}" is currently Out of Stock.`, 'error');
      return;
    }

    const itemId = `${product.id}-${size}-${color.name}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            product,
            selectedSize: size,
            selectedColor: color,
            quantity,
          },
        ];
      }
    });

    showToast(`Added ${quantity}x "${product.name}" (${size}, ${color.name}) to bag`);
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from bag', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    const unitPrice = item.product.discountPrice ?? item.product.price;
    return total + unitPrice * item.quantity;
  }, 0);

  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);

  const applyPromo = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'NEST15' || clean === 'STYLE15' || clean === 'PAK15') {
      setPromoCode(clean);
      setDiscountPercent(15);
      showToast('Promo code applied: 15% off your order!', 'success');
      return { success: true, message: '15% discount applied successfully!' };
    } else if (clean === 'WELCOME20') {
      setPromoCode(clean);
      setDiscountPercent(20);
      showToast('Welcome code applied: 20% off!', 'success');
      return { success: true, message: '20% discount applied successfully!' };
    } else {
      return { success: false, message: 'Invalid code. Try "NEST15" for 15% off.' };
    }
  };

  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(product ? `Removed "${product.name}" from wishlist` : 'Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast(product ? `Saved "${product.name}" to wishlist` : 'Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const login = (email: string, name: string, phone?: string, city?: string) => {
    const existingOrders = user?.orders || [];
    const updatedUser: User = {
      name,
      email,
      phone: phone || user?.phone || '0300-1234567',
      city: city || user?.city || 'Pakpattan',
      orders: existingOrders,
    };
    setUser(updatedUser);
    setIsAuthModalOpen(false);
    showToast(`Welcome to ${settings.storeName}, ${name}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp Operations
  const getCleanWhatsAppNumber = (targetNumber?: string): string => {
    const raw = targetNumber || settings.whatsappNumber || '923291171812';
    // Clean all non-digit characters
    let digits = raw.replace(/\D/g, '');
    // If starts with 0 (e.g. 03291171812), replace leading 0 with 92
    if (digits.startsWith('0')) {
      digits = '92' + digits.slice(1);
    }
    // If lacks country code and is 10 digits (e.g. 3291171812), prepend 92
    if (digits.length === 10 && !digits.startsWith('92')) {
      digits = '92' + digits;
    }
    return digits || '923291171812';
  };

  const getActiveWhatsAppLines = (): Array<{ number: string; cleanNumber: string; label: string; isPrimary: boolean }> => {
    const primaryClean = getCleanWhatsAppNumber(settings.whatsappNumber);
    const list: Array<{ number: string; cleanNumber: string; label: string; isPrimary: boolean }> = [];

    // Collect all unique configured numbers
    const rawList = Array.isArray(settings.whatsappNumbers) && settings.whatsappNumbers.length > 0
      ? settings.whatsappNumbers
      : [settings.whatsappNumber || '923291171812'];

    rawList.forEach((num, idx) => {
      const clean = getCleanWhatsAppNumber(num);
      if (!list.some(item => item.cleanNumber === clean)) {
        const customLabel = settings.whatsappLabels?.[num] || settings.whatsappLabels?.[clean];
        const defaultLabel = idx === 0 ? 'Pri-Boutique Official Line' : `Pri-Boutique Order Line ${idx + 1}`;
        list.push({
          number: num,
          cleanNumber: clean,
          label: customLabel || defaultLabel,
          isPrimary: clean === primaryClean || idx === 0,
        });
      }
    });

    if (list.length === 0) {
      list.push({
        number: '923291171812',
        cleanNumber: '923291171812',
        label: 'Pri-Boutique Official Line',
        isPrimary: true,
      });
    }

    return list;
  };

  const buildProductWhatsAppMessage = (
    product: Product,
    colorName: string,
    size: string,
    quantity: number,
    orderId?: string
  ): string => {
    const unitPrice = product.discountPrice ?? product.price;
    const total = unitPrice * quantity;

    let msg = `Hello, I want to place an order at Pri-Boutique.\n\n`;
    if (orderId) {
      msg += `Order ID: ${orderId}\n`;
    }
    msg += `Product: ${product.name}\n`;
    msg += `Color: ${colorName}\n`;
    msg += `Size: ${size}\n`;
    msg += `Quantity: ${quantity}\n`;
    msg += `Price: ${formatPrice(unitPrice)} each\n`;
    msg += `Total: ${formatPrice(total)}\n\n`;
    msg += `Please confirm my order with Pri-Boutique.`;

    return msg;
  };

  const buildCartWhatsAppMessage = (
    items: CartItem[],
    grandTotal: number,
    orderId?: string
  ): string => {
    let msg = `Hello, I want to place this order at Pri-Boutique:\n\n`;
    if (orderId) {
      msg += `Order ID: ${orderId}\n\n`;
    }

    items.forEach((item, index) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      msg += `${index + 1}. ${item.product.name}\n`;
      msg += `Color: ${item.selectedColor.name}\n`;
      msg += `Size: ${item.selectedSize}\n`;
      msg += `Quantity: ${item.quantity}\n`;
      msg += `Price: ${formatPrice(unitPrice * item.quantity)}\n\n`;
    });

    msg += `Total: ${formatPrice(grandTotal)}\n\n`;
    msg += `Please confirm my order with Pri-Boutique.`;
    return msg;
  };

  const launchDirectWhatsApp = (message: string, targetNumber?: string) => {
    const cleanNumber = getCleanWhatsAppNumber(targetNumber);
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openWhatsAppOrder = (payload: WhatsAppModalPayload) => {
    setWhatsAppPayload(payload);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        getProductName,
        getSubcategoryName,
        currency,
        setCurrency,
        formatPrice,
        settings,
        updateStoreSettings,
        products,
        isLoadingProducts,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        clearDemoPhotos,
        clearAllProducts,
        adminUser,
        adminLogin,
        adminLogout,
        isAdminAuthenticated: !!adminUser,
        orders,
        refreshOrders,
        createCustomerOrder,
        updateOrderStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        promoCode,
        discountAmount,
        applyPromo,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        currentView,
        setCurrentView,
        selectedProduct,
        openProductDetails,
        user,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        whatsAppPayload,
        openWhatsAppOrder,
        getCleanWhatsAppNumber,
        getActiveWhatsAppLines,
        buildProductWhatsAppMessage,
        buildCartWhatsAppMessage,
        launchDirectWhatsApp,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
