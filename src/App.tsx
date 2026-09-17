import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetails } from './components/ProductDetails';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchBar } from './components/SearchBar';
import { ToastContainer } from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { currentView, selectedProduct, isRTL, t } = useShop();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 font-sans selection:bg-amber-100 selection:text-amber-900"
    >
      {/* Navigation */}
      <Navbar />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}

        {currentView === 'men' && (
          <ProductCatalog
            key="men-catalog"
            initialCategory="men"
            title={t('categories.men')}
            subtitle={t('categories.menDesc')}
          />
        )}

        {currentView === 'women' && (
          <ProductCatalog
            key="women-catalog"
            initialCategory="women"
            title={t('categories.women')}
            subtitle={t('categories.womenDesc')}
          />
        )}

        {currentView === 'kids' && (
          <ProductCatalog
            key="kids-catalog"
            initialCategory="kids"
            title={t('categories.kids')}
            subtitle={t('categories.kidsDesc')}
          />
        )}

        {currentView === 'new-arrivals' && (
          <ProductCatalog
            key="new-arrivals-catalog"
            initialCategory="all"
            forceOnlyNew={true}
            title={t('sections.newArrivalsTitle')}
            subtitle={t('sections.newArrivalsSubtitle')}
          />
        )}

        {currentView === 'sale' && (
          <ProductCatalog
            key="sale-catalog"
            initialCategory="all"
            forceOnlySale={true}
            title={t('offers.title')}
            subtitle={t('offers.subtitle')}
          />
        )}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'product-detail' && (
          selectedProduct ? (
            <ProductDetails product={selectedProduct} />
          ) : (
            <HomePage />
          )
        )}
      </main>

      {/* Global Modals, Drawers & Notifications */}
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal />
      <CheckoutModal />
      <SearchBar />
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
