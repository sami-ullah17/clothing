import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PageView } from '../types';
import { SUPPORTED_LANGUAGES, Language } from '../i18n/translations';
import { PriButeeqLogo } from './PriButeeqLogo';
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
  Globe,
  Check,
  Lock,
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
    language,
    setLanguage,
    settings,
    adminUser,
    t,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const navLinks: { labelKey: string; view: PageView; highlight?: 'sale' | 'new' }[] = [
    { labelKey: 'nav.home', view: 'home' },
    { labelKey: 'nav.men', view: 'men' },
    { labelKey: 'nav.women', view: 'women' },
    { labelKey: 'nav.kids', view: 'kids' },
    { labelKey: 'nav.newArrivals', view: 'new-arrivals', highlight: 'new' },
    { labelKey: 'nav.sale', view: 'sale', highlight: 'sale' },
    { labelKey: 'nav.contact', view: 'contact' },
  ];

  const handleNavClick = (view: PageView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Store Owner Quick Bar if logged in */}
      {adminUser && (
        <div className="bg-neutral-900 border-b border-amber-500/30 text-amber-200 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Store Owner Active:</span>
              <span className="hidden sm:inline text-neutral-300">
                آپ لائیو ویب سائٹ دیکھ رہے ہیں — تمام پروڈکٹس کسٹمرز کو نظر آ رہی ہیں
              </span>
            </div>
            <button
              onClick={() => handleNavClick('admin')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>ایڈمن پینل (Admin Dashboard)</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-neutral-950 text-neutral-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="hidden sm:flex items-center gap-2 text-neutral-400">
            <span>{t('top.concierge')}</span>
          </div>

          <div className="flex-1 sm:flex-initial text-center flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-amber-200">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('top.delivery')}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-neutral-400">
            <button
              onClick={() => handleNavClick('contact')}
              className="hidden md:inline-block hover:text-white transition-colors"
            >
              {t('top.help')}
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors border border-neutral-800"
                aria-label="Select Language"
              >
                <span>{currentLangObj.flag}</span>
                <span className="text-xs font-semibold">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-1.5 w-44 bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 py-1.5 z-50 overflow-hidden text-left"
                  >
                    <div className="px-3 py-1 border-b border-neutral-100 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                            isSelected ? 'bg-amber-50/70 font-bold text-amber-900' : 'text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-xs">{lang.nativeName}</span>
                              <span className="text-[10px] text-neutral-400 font-normal">{lang.name}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="hidden sm:flex font-semibold text-white items-center gap-1">
              <span>🇵🇰</span>
              <span>PKR (₨)</span>
            </span>
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
            className="group focus:outline-none"
            aria-label="Pri-Boutique Home"
          >
            <PriButeeqLogo variant="navbar" showSubtext={true} />
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
                  {t(link.labelKey)}
                  {link.highlight === 'sale' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded">
                      {t('card.sale')}
                    </span>
                  )}
                  {link.highlight === 'new' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      {t('card.new')}
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
            <span className="text-xs">{t('nav.searchPlaceholder')}</span>
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
                        <p className="text-xs text-neutral-400 uppercase tracking-wider">{t('nav.signedInAs')}</p>
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
                          <span>{t('nav.savedWishlist')} ({wishlist.length})</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavClick('sale');
                          }}
                          className="w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5"
                        >
                          <Percent className="w-4 h-4 text-neutral-400" />
                          <span>{t('nav.memberOffers')}</span>
                        </button>
                      </div>

                      {user.orders.length > 0 && (
                        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                          <p className="text-xs font-medium text-neutral-700 flex items-center gap-1.5 mb-1">
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('nav.recentOrders')} ({user.orders.length})</span>
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            #{user.orders[0].id} ({user.orders[0].status})
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
                          <span>{t('nav.signOut')}</span>
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
                <span className="hidden sm:inline">{t('nav.signIn')}</span>
              </button>
            )}

            {/* Owner Portal quick toggle */}
            <button
              onClick={() => handleNavClick('admin')}
              title="Owner Portal"
              className="p-2 text-neutral-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors hidden sm:inline-flex"
              aria-label="Owner Admin Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
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
              {/* Mobile Language Switcher Row */}
              <div className="p-2 mb-2 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1 px-1">
                  Language / زبان
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`py-1.5 px-2 rounded-lg text-xs flex flex-col items-center justify-center font-medium transition-colors ${
                        language === lang.code
                          ? 'bg-neutral-950 text-white font-bold'
                          : 'bg-white border border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="text-[11px] truncate mt-0.5">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                  <span>{t(link.labelKey)}</span>
                  {link.highlight === 'sale' && (
                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded">
                      {t('card.sale')}
                    </span>
                  )}
                  {link.highlight === 'new' && (
                    <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      {t('card.new')}
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
                  <span>{user ? `${t('nav.account')} (${user.name})` : t('nav.signIn')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm text-neutral-700 font-medium py-2 px-3"
                >
                  <Heart className="w-4 h-4" />
                  <span>{t('wishlist.title')} ({wishlist.length})</span>
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-800 bg-neutral-100/70 hover:bg-neutral-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Owner Admin Portal</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                    Admin
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
