import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { HeroBanner } from './HeroBanner';
import { FeaturedCategories } from './FeaturedCategories';
import { ProductCard } from './ProductCard';
import { SpecialOffers } from './SpecialOffers';
import { CustomerReviews } from './CustomerReviews';
import { Newsletter } from './Newsletter';
import { ArrowRight, Sparkles, Flame, Layers } from 'lucide-react';
import { Category } from '../types';

export const HomePage: React.FC = () => {
  const { products, setCurrentView, t, isRTL } = useShop();
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | Category>('all');

  // Curate New Arrivals (products marked as new arrivals or the most recently added products)
  const explicitNewArrivals = products.filter((p) => p.isNewArrival !== false);
  const newArrivals = (explicitNewArrivals.length > 0 ? explicitNewArrivals : products).slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  // Curate Active Boutique Catalog items
  const catalogProducts = activeCatalogTab === 'all'
    ? products
    : products.filter((p) => p.category === activeCatalogTab);

  return (
    <div id="home-page" className="space-y-0">
      {/* 1. Large Fashion Hero Banner */}
      <HeroBanner />

      {/* 2. Featured Categories Section */}
      <FeaturedCategories />

      {/* 3. New Arrivals Section (When Products Available) */}
      {newArrivals.length > 0 && (
        <section id="new-arrivals-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('sections.newArrivalsTag')}</span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950">
                {t('sections.newArrivalsTitle')}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                {t('sections.newArrivalsSubtitle')}
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentView('new-arrivals');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 hover:text-amber-800 transition-colors underline-offset-8 hover:underline"
            >
              <span>{t('sections.viewAllNew')}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Interactive Boutique Catalog Section */}
      {products.length > 0 && (
        <section id="boutique-catalog-section" className="py-12 sm:py-16 bg-neutral-50/70 border-y border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'پری بوتیک کلیکشن' : 'Exclusive Catalog'}</span>
                </div>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950">
                  {isRTL ? 'ہماری تمام ورائٹی' : 'Curated Boutique Collection'}
                </h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {isRTL
                    ? 'خواتین، مردانہ اور بچوں کے بہترین دیدہ زیب ڈریسز'
                    : 'Discover finely tailored eastern pret, luxury unstitched & festive wear.'}
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setActiveCatalogTab('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCatalogTab === 'all'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {isRTL ? 'تمام سوٹ' : 'All Products'} ({products.length})
                </button>
                <button
                  onClick={() => setActiveCatalogTab('women')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCatalogTab === 'women'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {isRTL ? 'خواتین' : "Women's"} (
                  {products.filter((p) => p.category === 'women').length})
                </button>
                <button
                  onClick={() => setActiveCatalogTab('men')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCatalogTab === 'men'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {isRTL ? 'مردانہ' : "Men's"} (
                  {products.filter((p) => p.category === 'men').length})
                </button>
                <button
                  onClick={() => setActiveCatalogTab('kids')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCatalogTab === 'kids'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {isRTL ? 'بچے' : 'Kids'} (
                  {products.filter((p) => p.category === 'kids').length})
                </button>
              </div>
            </div>

            {catalogProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {catalogProducts.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                <p className="text-neutral-500 text-sm">
                  {isRTL
                    ? 'اس کیٹیگری میں فی الحال کوئی پراڈکٹ موجود نہیں۔'
                    : 'No products currently in this category.'}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Special Offers / Sale Section with countdown timer */}
      <SpecialOffers />

      {/* 6. Best Sellers Section (When Products Available) */}
      {bestSellers.length > 0 && (
        <section id="best-sellers-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-widest mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>{t('sections.bestSellersTag')}</span>
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950">
                {t('sections.bestSellersTitle')}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                {t('sections.bestSellersSubtitle')}
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentView('women');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 hover:text-amber-800 transition-colors underline-offset-8 hover:underline"
            >
              <span>{t('sections.exploreEssentials')}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Customer Reviews Section */}
      <CustomerReviews />

      {/* 8. Newsletter Subscription Section */}
      <Newsletter />
    </div>
  );
};
