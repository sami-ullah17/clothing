import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  MapPin,
  MessageCircle,
  Instagram,
  Lock,
  ExternalLink,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setCurrentView, getCleanWhatsAppNumber } = useShop();

  const handleOpenWhatsApp = () => {
    const cleanNumber = getCleanWhatsAppNumber();
    window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer id="main-footer" className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-neutral-800/80">
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {settings.storeName}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mb-1" />
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              {settings.storeDescription ||
                'Exclusive contemporary haute couture and bespoke luxury apparel crafted with exceptional artisanal fabrics and timeless aesthetics.'}
            </p>

            {/* Nationwide delivery note */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
              <Truck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Fast Doorstep Delivery Across Pakistan</span>
            </div>
          </div>

          {/* Column 2: Location & WhatsApp Inquiry */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-white">
              Boutique Location
            </h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-200 font-medium">
                  {settings.address || 'Pakpattan, Punjab, Pakistan'}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs text-neutral-500 mb-2">Order & Inquiry Line:</p>
                <button
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>+{settings.whatsappNumber}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Social Media & Owner Portal */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-white">
              Connect With Us
            </h4>

            <div className="flex flex-col gap-2.5 text-xs text-neutral-400">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800/80 group"
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span>Follow on Instagram</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-neutral-600" />
                </a>
              )}

              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800/80 group"
                >
                  <span className="font-black text-sm text-neutral-200">#</span>
                  <span>Follow on TikTok</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-neutral-600" />
                </a>
              )}

              {/* Owner Access Portal */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-[11px] text-neutral-500 hover:text-amber-400 transition-colors py-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Owner Admin Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</span>
            <span>•</span>
            <span>Pakpattan, Punjab, Pakistan</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-400 font-medium">Orders exclusively routed through WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
