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
  const { currentView, selectedProduct } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-neutral-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation */}
      <Navbar />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}

        {currentView === 'men' && (
          <ProductCatalog
            key="men-catalog"
            initialCategory="men"
            title="Men's Collection"
            subtitle="Italian tailored outerwear, crisp organic poplin shirts, and heritage Okayama selvedge denim."
          />
        )}

        {currentView === 'women' && (
          <ProductCatalog
            key="women-catalog"
            initialCategory="women"
            title="Women's Collection"
            subtitle="Pure Mulberry silk slip dresses, sculpted trench coats, and plush Mongolian cashmere sweaters."
          />
        )}

        {currentView === 'kids' && (
          <ProductCatalog
            key="kids-catalog"
            initialCategory="kids"
            title="Kids & Teens Collection"
            subtitle="Hypoallergenic organic cotton knitwear and resilient playground-ready stretch chinos."
          />
        )}

        {currentView === 'new-arrivals' && (
          <ProductCatalog
            key="new-arrivals-catalog"
            initialCategory="all"
            forceOnlyNew={true}
            title="New Season Arrivals"
            subtitle="The newest silhouettes from the Autumn/Winter capsule, fresh from our Italian ateliers."
          />
        )}

        {currentView === 'sale' && (
          <ProductCatalog
            key="sale-catalog"
            initialCategory="all"
            forceOnlySale={true}
            title="Archive & Mid-Season Sale"
            subtitle="Special pricing on selected garments. Use code NEST15 at checkout for an extra 15% off."
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
