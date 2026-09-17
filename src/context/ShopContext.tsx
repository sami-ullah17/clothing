import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Size, ProductColor, User, Order, Address, PageView } from '../types';
import { SAMPLE_PRODUCTS } from '../data/products';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ShopContextType {
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

  // User & Auth
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Checkout
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  placeOrder: (address: Address) => Order;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Quick View / Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('stylenest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stylenest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize user from localStorage
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('stylenest_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Unable to persist cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('stylenest_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Unable to persist wishlist', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('stylenest_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('stylenest_user');
      }
    } catch (e) {
      console.warn('Unable to persist user', e);
    }
  }, [user]);

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart operations
  const addToCart = (
    product: Product,
    size: Size = product.sizes[0] || 'M',
    color: ProductColor = product.colors[0],
    quantity: number = 1
  ) => {
    const itemId = `${product.id}-${size}-${color.name}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
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

    showToast(`Added ${quantity}x "${product.name}" (${size}, ${color.name}) to cart`);
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showToast('Item removed from cart', 'info');
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
    if (clean === 'NEST15' || clean === 'STYLE15') {
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

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(product ? `Removed "${product.name}" from wishlist` : 'Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast(product ? `Saved "${product.name}" to wishlist` : 'Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // User authentication
  const login = (email: string, name: string) => {
    const existingOrders = user?.orders || [];
    const updatedUser: User = {
      name,
      email,
      orders: existingOrders,
    };
    setUser(updatedUser);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${name}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  // Order placement
  const placeOrder = (address: Address): Order => {
    const shipping = cartSubtotal >= 75 ? 0 : 9.99;
    const orderTotal = Math.max(0, cartSubtotal - discountAmount + shipping);
    const orderId = 'SN-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping,
      total: orderTotal,
      status: 'Processing',
      shippingAddress: address,
    };

    if (user) {
      setUser({
        ...user,
        orders: [newOrder, ...user.orders],
      });
    }

    clearCart();
    return newOrder;
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ShopContext.Provider
      value={{
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
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
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
