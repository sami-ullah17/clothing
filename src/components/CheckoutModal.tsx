import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Address, Order } from '../types';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    placeOrder,
    user,
    setCurrentView,
  } = useShop();

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 234-8901');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10001');
  const [country, setCountry] = useState('United States');

  // Payment mock state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isCheckoutOpen) return null;

  const shippingCost = cartSubtotal >= 75 ? 0 : 9.99;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !street.trim() || !city.trim() || !zip.trim()) {
      setError('Please fill in all required shipping fields.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const shippingAddress: Address = {
        fullName,
        email,
        phone,
        street,
        city,
        state,
        zip,
        country,
      };

      const order = placeOrder(shippingAddress);
      setCompletedOrder(order);
      setIsProcessing(false);
      setStep('confirmation');
    }, 1200);
  };

  const handleFinish = () => {
    setIsCheckoutOpen(false);
    setStep('address');
    setCompletedOrder(null);
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-neutral-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-900" />
            <span className="font-serif-luxury text-lg font-bold text-neutral-950">
              StyleNest Secure Checkout
            </span>
          </div>

          {step !== 'confirmation' && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1 text-neutral-400 hover:text-neutral-950 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step !== 'confirmation' && (
          <div className="px-6 pt-4 pb-2 border-b border-neutral-100 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 ${step === 'address' ? 'font-bold text-neutral-950' : 'text-neutral-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'address' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                1
              </span>
              <span>Delivery Details</span>
            </div>
            <div className="h-[1px] flex-1 mx-4 bg-neutral-200" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'font-bold text-neutral-950' : 'text-neutral-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                2
              </span>
              <span>Payment & Review</span>
            </div>
          </div>
        )}

        {/* Step 1: Address Form */}
        {step === 'address' && (
          <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-950 mb-2">
              Shipping Destination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email for Tracking</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">ZIP / Postal</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            {/* Order summary mini bar */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
              <span className="text-neutral-500">Total with shipping:</span>
              <span className="font-extrabold text-neutral-950">${finalTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow flex items-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Form */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-950">
              Payment Method
            </h3>

            {/* Test Card Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>Sandbox Test Mode Active. Pre-populated for fast checkout.</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Expiration</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Security CVC</label>
                  <input
                    type="password"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Shipping destination summary */}
            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 flex justify-between items-center">
              <div>
                <span className="font-semibold text-neutral-900">Ship to: </span>
                <span>{street}, {city}, {state} {zip}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('address')}
                className="text-neutral-900 font-semibold underline"
              >
                Edit
              </button>
            </div>

            {/* Summary total */}
            <div className="p-4 bg-neutral-50 rounded-xl space-y-1.5 text-xs text-neutral-600 border border-neutral-200">
              <div className="flex justify-between">
                <span>Items ({cart.reduce((t, i) => t + i.quantity, 0)}):</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Courier Shipping:</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total Due:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('address')}
                className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-8 py-3 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ${finalTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation */}
        {step === 'confirmation' && completedOrder && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Order Confirmed
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-950 mt-2">
                Thank You for Your Order!
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                Order <strong>#{completedOrder.id}</strong> has been logged and dispatched to our atelier.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <div>
                  <p className="font-semibold text-neutral-900">Destination</p>
                  <p className="text-neutral-500">
                    {completedOrder.shippingAddress.fullName}<br />
                    {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} {completedOrder.shippingAddress.zip}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">Status</p>
                  <p className="text-emerald-700 font-bold">{completedOrder.status}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 mb-1.5">Purchased Items</p>
                <div className="space-y-1 text-neutral-600">
                  {completedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}x {it.product.name} ({it.selectedSize}, {it.selectedColor.name})
                      </span>
                      <span className="font-semibold text-neutral-900">
                        ${((it.product.discountPrice ?? it.product.price) * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between font-extrabold text-sm text-neutral-950">
                <span>Total Charged</span>
                <span>${completedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                Continue Shopping StyleNest
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
