import React from 'react';
import { useShop } from '../context/ShopContext';
import { PageView } from '../types';
import { Heart, ShieldCheck, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useShop();

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
              Contemporary high-end fashion engineered for versatility, ethical craftsmanship, and enduring elegance. Defining personal style across generations.
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
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => handleNav('women')}
                  className="hover:text-white transition-colors"
                >
                  Women's Line
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('men')}
                  className="hover:text-white transition-colors"
                >
                  Men's Tailoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('kids')}
                  className="hover:text-white transition-colors"
                >
                  Kids & Teens
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('new-arrivals')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>New Arrivals</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('sale')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Archive Sale (-40%)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact & Store Flagships
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  Shipping & Customs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  30-Day Hassle-Free Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  Sustainability & Sourcing
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors"
                >
                  FAQ & Care Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Store Flags & Hours */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-4">
              Global Flagship
            </h4>
            <div className="text-sm text-neutral-400 space-y-2">
              <p className="text-neutral-200 font-medium">StyleNest Fifth Avenue</p>
              <p>740 5th Avenue, New York, NY</p>
              <p className="pt-2 text-xs text-neutral-500">
                Mon - Sat: 10:00 AM – 8:00 PM<br />
                Sunday: 11:00 AM – 6:00 PM
              </p>
              <p className="pt-1 text-xs text-neutral-400">
                Direct: concierge@stylenest.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Payment methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} StyleNest Apparel Inc. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for modern fashion
            </span>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">VISA</span>
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">MASTERCARD</span>
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">AMEX</span>
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">APPLE PAY</span>
            <span className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
