import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setCurrentView, t, isRTL } = useShop();

  return (
    <div className="relative overflow-hidden bg-neutral-900 text-white">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/pakistani_boutique_hero.jpg"
          alt="Pri-Boutique Luxury Pakistani Haute Couture Collection"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[50%_35%] scale-105 transform transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/30 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 flex flex-col justify-center min-h-[620px] lg:min-h-[720px]">
        <div className="max-w-2xl">
          {/* Subtle Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-neutral-200 text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('hero.tag')}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] mb-6"
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-neutral-300 font-normal leading-relaxed mb-8 max-w-xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              id="hero-shop-now-btn"
              onClick={() => {
                setCurrentView('new-arrivals');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm tracking-wider uppercase rounded-xl shadow-2xl flex items-center gap-3 transition-all hover:gap-4 hover:shadow-white/10 active:scale-[0.98]"
            >
              <span>{t('hero.shopNow')}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button
              id="hero-women-btn"
              onClick={() => {
                setCurrentView('women');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wider uppercase rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-[0.98]"
            >
              {t('hero.womenLine')}
            </button>

            <button
              id="hero-men-btn"
              onClick={() => {
                setCurrentView('men');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wider uppercase rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-[0.98]"
            >
              {t('hero.menLine')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="relative z-10 border-t border-white/10 bg-neutral-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-neutral-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">{t('hero.freeDelivery')}</p>
              <p className="text-[11px] text-neutral-400">{t('hero.freeDeliverySub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">{t('hero.easyExchange')}</p>
              <p className="text-[11px] text-neutral-400">{t('hero.easyExchangeSub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">{t('hero.artisanalQuality')}</p>
              <p className="text-[11px] text-neutral-400">{t('hero.artisanalQualitySub')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">{t('hero.styleConcierge')}</p>
              <p className="text-[11px] text-neutral-400">{t('hero.styleConciergeSub')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
