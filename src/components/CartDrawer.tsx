import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    setIsCheckoutOpen,
    setCurrentView,
  } = useShop();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 75;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const shippingCost = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 9.99;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromo(inputCode);
    setPromoMessage({ text: res.message, success: res.success });
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-sm transition-opacity">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-neutral-200"
      >
        {/* Cart Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-950" />
            <h3 className="font-serif-luxury text-xl font-bold text-neutral-950">
              Your Shopping Bag
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-800 rounded-full">
              {cart.reduce((t, i) => t + i.quantity, 0)}
            </span>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            {remainingForFree > 0 ? (
              <span className="text-neutral-700">
                Add <strong className="text-neutral-950 font-bold">${remainingForFree.toFixed(0)}</strong> more for <strong>FREE shipping</strong>!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Congratulations! You unlocked FREE express delivery
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
                Your bag is empty
              </h4>
              <p className="text-neutral-500 text-xs max-w-xs mb-6">
                Discover pieces from our latest Autumn / Winter runway capsule.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentView('new-arrivals');
                }}
                className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const unitPrice = item.product.discountPrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors shadow-sm"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-xl bg-neutral-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-neutral-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700">Size: {item.selectedSize}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span>{item.selectedColor.name}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
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

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-950">
                          ${(unitPrice * item.quantity).toFixed(0)}
                        </span>
                        {item.product.discountPrice && (
                          <span className="text-[11px] text-neutral-400 line-through block">
                            ${(item.product.price * item.quantity).toFixed(0)}
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

        {/* Cart Footer / Checkout Summary */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 p-6 bg-neutral-50/70 space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Promo code (try NEST15)"
                    className="w-full pl-8 pr-3 py-2 text-xs uppercase bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  Apply
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
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount ({promoCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700 font-bold">FREE</strong>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total Due</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
