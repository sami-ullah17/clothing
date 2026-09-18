import React from 'react';
import { useShop } from '../context/ShopContext';
import { HeroBanner } from './HeroBanner';
import { FeaturedCategories } from './FeaturedCategories';
import { ProductCard } from './ProductCard';
import { SpecialOffers } from './SpecialOffers';
import { CustomerReviews } from './CustomerReviews';
import { Newsletter } from './Newsletter';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, setCurrentView, t, isRTL } = useShop();

  // Curate New Arrivals and Best Sellers from dynamic products
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

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

      {/* 4. Special Offers / Sale Section with countdown timer */}
      <SpecialOffers />

      {/* 5. Best Sellers Section (When Products Available) */}
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

      {/* 6. Customer Reviews Section */}
      <CustomerReviews />

      {/* 7. Newsletter Subscription Section */}
      <Newsletter />
    </div>
  );
};
