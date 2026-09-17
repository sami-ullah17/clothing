import React, { useState } from 'react';
import {
  useShop,
  FREE_SHIPPING_THRESHOLD_PKR,
  STANDARD_SHIPPING_PKR,
} from '../context/ShopContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Tag,
  Check,
  MessageCircle,
  Shirt,
} from 'lucide-react';
import { motion } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    discountAmount,
    promoCode,
    applyPromo,
    openWhatsAppOrder,
    setCurrentView,
    formatPrice,
    settings,
    t,
    isRTL,
    getProductName,
  } = useShop();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isCartOpen) return null;

  const progressToFreeShipping = Math.min(
    100,
    (cartSubtotal / FREE_SHIPPING_THRESHOLD_PKR) * 100
  );
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD_PKR - cartSubtotal);

  const shippingCost =
    cartSubtotal >= FREE_SHIPPING_THRESHOLD_PKR || cartSubtotal === 0
      ? 0
      : STANDARD_SHIPPING_PKR;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromo(inputCode);
    setPromoMessage({ text: res.message, success: res.success });
  };

  const handleOrderOnWhatsApp = () => {
    setIsCartOpen(false);
    openWhatsAppOrder({ fromCart: true });
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${isRTL ? 'justify-start' : 'justify-end'} bg-neutral-950/60 backdrop-blur-sm transition-opacity`}>
      <motion.div
        initial={{ x: isRTL ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isRTL ? '-100%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-neutral-200"
      >
        {/* Cart Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-950" />
            <h3 className="font-serif-luxury text-xl font-bold text-neutral-950">
              {t('cart.title')}
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-800 rounded-full">
              {cart.reduce((total, i) => total + i.quantity, 0)}
            </span>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter (Pakistan) */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            {remainingForFree > 0 ? (
              <span className="text-neutral-700">
                <strong className="text-neutral-950 font-bold">{formatPrice(remainingForFree)}</strong> {t('cart.awayFromFree')}
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t('cart.freeShippingUnlocked')}
              </span>
            )}
            <span className="text-neutral-400 text-[11px] font-semibold">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                remainingForFree === 0 ? 'bg-emerald-600' : 'bg-neutral-950'
              }`}
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif-luxury text-lg font-bold text-neutral-900 mb-1">
                {t('cart.empty')}
              </h4>
              <p className="text-neutral-500 text-xs max-w-xs mb-6">
                {t('cart.emptyDesc')}
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentView('new-arrivals');
                }}
                className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                {t('cart.browseCollection')}
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const unitPrice = item.product.discountPrice ?? item.product.price;
              const localizedName = getProductName(item.product.id, item.product.name);
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors shadow-sm"
                >
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={localizedName}
                      className="w-20 h-24 object-cover rounded-xl bg-neutral-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-neutral-100 to-amber-50/50 border border-neutral-200/80 flex flex-col items-center justify-center text-amber-800 flex-shrink-0">
                      <Shirt className="w-6 h-6 text-neutral-600" />
                      <span className="text-[8px] font-bold text-neutral-500 mt-1">Boutique</span>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-1">
                          {localizedName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span>{item.selectedColor.name}</span>
                        </span>
                        <span>•</span>
                        <span>Size: <strong className="text-neutral-700">{item.selectedSize}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-950"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-950"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price in PKR */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-950">
                          {formatPrice(unitPrice * item.quantity)}
                        </span>
                        {item.product.discountPrice && (
                          <span className="text-[11px] text-neutral-400 line-through block">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Footer / WhatsApp Order Summary */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-6 bg-neutral-50/70 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className={`w-3.5 h-3.5 text-neutral-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder={t('cart.promoPlaceholder')}
                    className={`w-full ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2 text-xs uppercase bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  {t('cart.apply')}
                </button>
              </div>

              {promoMessage && (
                <p
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    promoMessage.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {promoMessage.success && <Check className="w-3 h-3" />}
                  {promoMessage.text}
                </p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200/60">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-neutral-900">{formatPrice(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>{t('cart.discount')} ({promoCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700 font-bold">{t('cart.complimentary')}</strong>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* WhatsApp Order Button */}
            <button
              id="order-on-whatsapp-cart-btn"
              onClick={handleOrderOnWhatsApp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Order via Pri-Buteeq WhatsApp • {formatPrice(grandTotal)}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Direct order & concierge desk: Pri-Buteeq Official</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
