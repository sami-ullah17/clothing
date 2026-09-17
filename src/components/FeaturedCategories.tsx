import React from 'react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES_DATA } from '../data/products';
import { PageView } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export const FeaturedCategories: React.FC = () => {
  const { setCurrentView, t, isRTL } = useShop();

  const handleCategoryClick = (id: string) => {
    setCurrentView(id as PageView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = (id: string, fallback: string) => {
    if (id === 'men') return t('categories.men');
    if (id === 'women') return t('categories.women');
    if (id === 'kids') return t('categories.kids');
    return fallback;
  };

  const getCategoryTagline = (id: string, fallback: string) => {
    if (id === 'men') return t('categories.menTagline');
    if (id === 'women') return t('categories.womenTagline');
    if (id === 'kids') return t('categories.kidsTagline');
    return fallback;
  };

  return (
    <section id="featured-categories-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            {t('categories.tag')}
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 mt-1">
            {t('categories.title')}
          </h2>
        </div>
        <p className="text-neutral-500 text-sm max-w-md mt-3 md:mt-0 leading-relaxed">
          {t('categories.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {CATEGORIES_DATA.map((cat, idx) => {
          const localizedName = getCategoryName(cat.id, cat.name);
          const localizedTagline = getCategoryTagline(cat.id, cat.tagline);

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative h-[450px] sm:h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
            >
              {/* Category Image */}
              <img
                src={cat.image}
                alt={localizedName}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Count Badge */}
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                  {cat.count}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
                <span className="text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  {localizedTagline}
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white mb-4">
                  {localizedName}
                </h3>

                <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                  <span>{t('categories.explore')}</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-amber-300 group-hover:text-neutral-950 flex items-center justify-center transition-all">
                    <ArrowUpRight className={`w-4 h-4 ${isRTL ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
