import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PageView } from '../types';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  PackageCheck,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    user,
    logout,
    setIsAuthModalOpen,
    setIsSearchOpen,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks: { label: string; view: PageView; highlight?: 'sale' | 'new' }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Men', view: 'men' },
    { label: 'Women', view: 'women' },
    { label: 'Kids', view: 'kids' },
    { label: 'New Arrivals', view: 'new-arrivals', highlight: 'new' },
    { label: 'Sale', view: 'sale', highlight: 'sale' },
    { label: 'Contact', view: 'contact' },
  ];

  const handleNavClick = (view: PageView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Banner */}
      <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-neutral-400">
            <span>Customer Concierge: +1 (800) 582-NEST</span>
          </div>
          <div className="flex-1 sm:flex-initial text-center flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              Complimentary Global Delivery on orders over $75
            </span>
            <span className="hidden md:inline text-neutral-400">• Use code <strong className="text-white tracking-wider">NEST15</strong> for 15% off</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => handleNavClick('contact')}
              className="hover:text-white transition-colors"
            >
              Need Help?
            </button>
            <span>USD $</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <div className="flex items-center lg:hidden">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-neutral-800 hover:text-neutral-950 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            id="mobile-search-btn"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 ml-1 text-neutral-700 hover:text-neutral-950"
            aria-label="Search clothing"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <button
            id="navbar-brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-baseline gap-1 group text-left"
          >
            <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 group-hover:text-neutral-800 transition-colors">
              StyleNest
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-700 mb-1" />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                id={`nav-link-${link.view}`}
                onClick={() => handleNavClick(link.view)}
                className={`relative py-2 text-sm font-medium tracking-wide transition-all ${
                  isActive
                    ? 'text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.label}
                  {link.highlight === 'sale' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded">
                      Sale
                    </span>
                  )}
                  {link.highlight === 'new' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      New
                    </span>
                  )}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Search Button */}
          <button
            id="desktop-search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-sm text-neutral-500 bg-neutral-100 hover:bg-neutral-200/80 rounded-full transition-colors"
            aria-label="Search catalog"
          >
            <Search className="w-4 h-4 text-neutral-400" />
            <span className="text-xs">Search coats, dresses, knitwear...</span>
            <kbd className="hidden xl:inline-block text-[10px] bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-neutral-400">
              /
            </kbd>
          </button>

          {/* Wishlist Button */}
          <button
            id="wishlist-trigger-btn"
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={`Wishlist with ${wishlist.length} items`}
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            id="cart-trigger-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-neutral-950 text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  id="user-account-dropdown-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full text-sm font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 text-left"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-neutral-900 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsWishlistOpen(true);
                          }}
                          className="w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5"
                        >
                          <Heart className="w-4 h-4 text-neutral-400" />
                          <span>Saved Wishlist ({wishlist.length})</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavClick('sale');
                          }}
                          className="w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5"
                        >
                          <Percent className="w-4 h-4 text-neutral-400" />
                          <span>Member Exclusive Offers</span>
                        </button>
                      </div>

                      {user.orders.length > 0 && (
                        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                          <p className="text-xs font-medium text-neutral-700 flex items-center gap-1.5 mb-1">
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Recent Orders ({user.orders.length})</span>
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Latest: #{user.orders[0].id} ({user.orders[0].status})
                          </p>
                        </div>
                      )}

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                id="login-modal-open-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-neutral-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium ${
                    currentView === link.view
                      ? 'bg-neutral-100 text-neutral-950 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.highlight === 'sale' && (
                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded">
                      Sale
                    </span>
                  )}
                  {link.highlight === 'new' && (
                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      New
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (user) {
                      setIsUserMenuOpen(true);
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-neutral-700 font-medium py-2 px-3"
                >
                  <User className="w-4 h-4" />
                  <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm text-neutral-700 font-medium py-2 px-3"
                >
                  <Heart className="w-4 h-4" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
