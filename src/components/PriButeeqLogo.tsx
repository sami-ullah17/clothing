import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';

interface PriButeeqLogoProps {
  variant?: 'navbar' | 'footer' | 'hero' | 'modal' | 'icon';
  showSubtext?: boolean;
  light?: boolean;
  className?: string;
}

export const PriButeeqLogo: React.FC<PriButeeqLogoProps> = ({
  variant = 'navbar',
  showSubtext = true,
  light = false,
  className = '',
}) => {
  const { settings } = useShop();
  const [imageError, setImageError] = useState(false);

  const logoSrc = settings.storeLogo || '/pributeeq_logo.jpg';

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {!imageError ? (
          <img
            src={logoSrc}
            alt="Pri-Boutique Monogram"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-10 h-10 rounded-full object-cover border border-amber-400/40 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-950 border border-amber-400/50 flex items-center justify-center text-amber-300 font-serif-luxury font-bold text-sm tracking-wider shadow-sm">
            PB
          </div>
        )}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        {/* Luxury Crest Icon */}
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-amber-400/30 bg-neutral-900 shadow-md flex-shrink-0 flex items-center justify-center group">
          {!imageError ? (
            <img
              src={logoSrc}
              alt="Pri-Boutique Emblem"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 flex items-center justify-center">
              <span className="font-serif-luxury text-amber-300 font-bold text-lg tracking-wider">
                PB
              </span>
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-400/20 pointer-events-none" />
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-serif-luxury text-2xl font-bold tracking-[0.08em] text-white">
              PRI-BOUTIQUE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
          {showSubtext && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/90 font-sans">
              Haute Couture • Pakpattan
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="w-11 h-11 rounded-2xl overflow-hidden border border-amber-300/40 bg-neutral-950 shadow-inner flex-shrink-0 flex items-center justify-center">
          {!imageError ? (
            <img
              src={logoSrc}
              alt="Pri-Boutique"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif-luxury text-amber-300 font-bold text-sm tracking-wider">
              PB
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-serif-luxury text-lg font-bold tracking-wide text-white">
              Pri-Boutique
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-200">
            Official Boutique Desk • Pakpattan
          </span>
        </div>
      </div>
    );
  }

  // Default: Navbar variant
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none text-left ${className}`}>
      {/* Emblem Medal */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-950 shadow-sm flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:border-amber-500/60">
        {!imageError ? (
          <img
            src={logoSrc}
            alt="Pri-Boutique Brand Logo"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
            <span className="font-serif-luxury text-amber-400 font-bold text-xs sm:text-sm tracking-wider">
              PB
            </span>
          </div>
        )}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-amber-400/20 pointer-events-none" />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-serif-luxury text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-[0.06em] transition-colors leading-none ${
              light ? 'text-white' : 'text-neutral-950 group-hover:text-amber-900'
            }`}
          >
            PRI-BOUTIQUE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mb-0.5" />
        </div>
        {showSubtext && (
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800/80 font-sans mt-0.5 leading-tight">
            Pakpattan Boutique
          </span>
        )}
      </div>
    </div>
  );
};
