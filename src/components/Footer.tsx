import React from 'react';
import { useShop } from '../context/ShopContext';
import { PageView } from '../types';
import { Heart, ShieldCheck, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, t } = useShop();

  const handleNav = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-neutral-800/80">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <button
              onClick={() => handleNav('home')}
              className="flex items-baseline gap-1 text-left mb-4 group"
            >
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                StyleNest
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 mb-1" />
            </button>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mb-6">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-3 text-neutral-400">
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">
              {t('footer.collections')}
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => handleNav('women')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.women')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('men')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.men')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('kids')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.kids')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('new-arrivals')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>{t('nav.newArrivals')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('sale')}
                  className="hover:text-rose-400 transition-colors"
                >
                  {t('nav.sale')} (-40%)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">
              {t('footer.concierge')}
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.contactStores')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.shipping')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.returns')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.sustainability')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Store Flags & Hours */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">
              {t('footer.pakistanStores')}
            </h4>
            <div className="text-sm text-neutral-400 space-y-2">
              <p className="text-neutral-200 font-medium">{t('footer.lahoreStore')}</p>
              <p>{t('footer.lahoreAddress')}</p>
              <p className="text-neutral-200 font-medium pt-1">{t('footer.karachiStore')}</p>
              <p>{t('footer.karachiAddress')}</p>
              <p className="pt-2 text-xs text-neutral-500">
                {t('footer.hours')}
              </p>
              <p className="pt-1 text-xs text-neutral-400">
                {t('footer.helpline')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Payment methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              {t('footer.nationwide')}
            </span>
          </div>

          {/* Payment Badges in Pakistan */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-neutral-300">
            <span className="px-2.5 py-1 bg-red-950/80 text-red-300 rounded border border-red-800/80 font-bold">
              JAZZCASH
            </span>
            <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800/80 font-bold">
              EASYPAISA
            </span>
            <span className="px-2.5 py-1 bg-blue-950/80 text-blue-300 rounded border border-blue-800/80 font-bold">
              RAAST / BANK
            </span>
            <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 rounded border border-amber-800/80 font-bold">
              COD (CASH ON DELIVERY)
            </span>
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">
              VISA / 1LINK
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
