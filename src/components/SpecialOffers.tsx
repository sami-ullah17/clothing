import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Flame, Clock, ArrowRight, Tag, Copy, Check } from 'lucide-react';

export const SpecialOffers: React.FC = () => {
  const { products, setCurrentView, showToast, applyPromo, t, isRTL } = useShop();

  // Interactive sale countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 35,
  });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyPromo = () => {
    navigator.clipboard.writeText('NEST15');
    setIsCopied(true);
    applyPromo('NEST15');
    showToast('Promo code "NEST15" copied & applied for 15% off!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const saleProducts = products.filter(p => p.discountPrice).slice(0, 4);

  return (
    <section id="special-offers-section" className="py-16 sm:py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with countdown */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Flame className="w-4 h-4" />
              <span>{t('offers.tag')}</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {t('offers.title')}
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
              {t('offers.subtitle')}
            </p>
          </div>

          {/* Countdown Box & Promo Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-800/80 px-4 py-3 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-neutral-400 uppercase tracking-wider mr-1">
                {t('offers.endsIn')}:
              </span>
              <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold text-white">
                <span className="bg-neutral-900 px-2 py-1 rounded border border-white/10">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-neutral-900 px-2 py-1 rounded border border-white/10">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-neutral-900 px-2 py-1 rounded border border-white/10 text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Promo Code Pill */}
            <button
              onClick={copyPromo}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-all cursor-pointer text-xs sm:text-sm font-semibold"
              title="Click to copy and apply discount"
            >
              <Tag className="w-4 h-4" />
              <span>{t('offers.codePill')}</span>
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          </div>
        </div>

        {/* Highlighted Sale Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {saleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all sale button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              setCurrentView('sale');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-100 transition-all shadow-xl"
          >
            <span>{t('offers.viewAll')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
};
