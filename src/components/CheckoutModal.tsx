import React, { useState } from 'react';
import { useShop, FREE_SHIPPING_THRESHOLD_PKR, STANDARD_SHIPPING_PKR } from '../context/ShopContext';
import { Address, Order, PaymentMethod, PaymentDetails } from '../types';
import {
  PAKISTAN_CITIES,
  PAKISTAN_PROVINCES,
  PAKISTAN_BANKS,
  JAZZCASH_CONFIG,
  EASYPAISA_CONFIG,
} from '../data/products';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Smartphone,
  Banknote,
  User,
  Sparkles,
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
    login,
    formatPrice,
    setCurrentView,
    showToast,
    t,
    isRTL,
    getProductName,
  } = useShop();

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form states (Pre-filled for Pakistan context)
  const [fullName, setFullName] = useState(user?.name || 'Ahmad Raza');
  const [email, setEmail] = useState(user?.email || 'ahmad.raza@example.pk');
  const [phone, setPhone] = useState(user?.phone || '0300-1234567');
  const [street, setStreet] = useState('House 42, Street 14, Sector F-7/2');
  const [city, setCity] = useState(user?.city || 'Islamabad');
  const [state, setState] = useState('Islamabad Capital Territory');
  const [zip, setZip] = useState('44000');
  const [country] = useState('Pakistan');

  // Quick account creation prompt for new users
  const [createAccountOnCheckout, setCreateAccountOnCheckout] = useState(!user);

  // Payment Selection State
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('jazzcash');

  // JazzCash specifics
  const [jazzcashNumber, setJazzcashNumber] = useState('0300-1234567');
  const [jazzcashCnic, setJazzcashCnic] = useState('123456');

  // Easypaisa specifics
  const [easypaisaNumber, setEasypaisaNumber] = useState('0345-1234567');

  // Bank Transfer specifics
  const [selectedBankId, setSelectedBankId] = useState<string>('meezan');
  const [bankTransRef, setBankTransRef] = useState('');
  const [senderAccountTitle, setSenderAccountTitle] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card payment mock state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isCheckoutOpen) return null;

  const shippingCost = cartSubtotal >= FREE_SHIPPING_THRESHOLD_PKR ? 0 : STANDARD_SHIPPING_PKR;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !street.trim() || !city.trim()) {
      setError('Please fill in all required delivery fields.');
      return;
    }
    setError('');

    // If new user wants to sign in / register automatically
    if (!user && createAccountOnCheckout) {
      login(email.trim(), fullName.trim(), phone.trim(), city.trim());
    }

    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Prepare payment metadata
    const paymentDetails: PaymentDetails = {
      method: selectedMethod,
      mobileNumber:
        selectedMethod === 'jazzcash'
          ? jazzcashNumber
          : selectedMethod === 'easypaisa'
          ? easypaisaNumber
          : phone,
      bankName:
        selectedMethod === 'bank_transfer'
          ? PAKISTAN_BANKS.find((b) => b.id === selectedBankId)?.name
          : undefined,
      accountTitle:
        selectedMethod === 'bank_transfer' ? senderAccountTitle || fullName : undefined,
      transactionRef:
        selectedMethod === 'bank_transfer'
          ? bankTransRef || `TRX-${Math.floor(100000 + Math.random() * 900000)}`
          : undefined,
      lastFourDigits: selectedMethod === 'card' ? '4242' : undefined,
    };

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

      const order = placeOrder(shippingAddress, selectedMethod, paymentDetails);
      setCompletedOrder(order);
      setIsProcessing(false);
      setStep('confirmation');
    }, 1300);
  };

  const handleFinish = () => {
    setIsCheckoutOpen(false);
    setStep('address');
    setCompletedOrder(null);
    setCurrentView('home');
  };

  const currentBank = PAKISTAN_BANKS.find((b) => b.id === selectedBankId) || PAKISTAN_BANKS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-neutral-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">
              PK
            </div>
            <div>
              <span className="font-serif-luxury text-base sm:text-lg font-bold text-neutral-950 block leading-tight">
                {t('checkout.title')}
              </span>
              <span className="text-[11px] text-neutral-500">
                Official Nationwide Delivery • PKR (₨)
              </span>
            </div>
          </div>

          {step !== 'confirmation' && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-200/60 transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step !== 'confirmation' && (
          <div className="px-6 pt-3.5 pb-2 border-b border-neutral-100 flex items-center justify-between text-xs bg-white">
            <div
              className={`flex items-center gap-2 ${
                step === 'address' ? 'font-bold text-neutral-950' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'address'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                1
              </span>
              <span>{t('checkout.step1')}</span>
            </div>
            <div className="h-[1px] flex-1 mx-3 bg-neutral-200" />
            <div
              className={`flex items-center gap-2 ${
                step === 'payment' ? 'font-bold text-neutral-950' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'payment'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                2
              </span>
              <span>{t('checkout.step2')}</span>
            </div>
          </div>
        )}

        {/* Step 1: Address Form */}
        {step === 'address' && (
          <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
            {/* New User Account Prompt if guest */}
            {!user && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-amber-800 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      New Client? Create Account with this order
                    </span>
                    <span className="text-amber-800 text-[11px]">
                      Track delivery in Pakistan & access private seasonal discounts.
                    </span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createAccountOnCheckout}
                    onChange={(e) => setCreateAccountOnCheckout(e.target.checked)}
                    className="w-4 h-4 rounded text-neutral-950 focus:ring-neutral-900 border-neutral-300"
                  />
                  <span className="text-xs font-semibold text-neutral-900">Auto-Register</span>
                </label>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-1">
                Recipient & Contact Details
              </h3>
              <p className="text-xs text-neutral-500">
                Courier rider (TCS / Leopards / Call Courier) will call on your mobile number before delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ahmad Raza"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.phone')}
                </label>
                <div className="relative">
                  <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500`}>
                    🇵🇰 +92
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="300-1234567"
                    className={`w-full ${isRTL ? 'pr-14 pl-3' : 'pl-14 pr-3'} py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('checkout.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@example.com"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            {/* City & Province selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.city')}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.province')}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                >
                  {PAKISTAN_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {t('checkout.street')}
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="House #, Street #, Block / Sector, DHA Phase / Bahria Town"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.postalCode')}
                </label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 bg-neutral-100 rounded-xl text-neutral-600 font-medium"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            {/* Delivery Total notice */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-sm">
              <span className="text-neutral-500 text-xs">
                {t('cart.subtotal')} ({cart.length} pieces):
              </span>
              <span className="font-extrabold text-neutral-950">
                {formatPrice(finalTotal)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Back to Bag
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow flex items-center gap-2"
              >
                <span>{t('checkout.continueToPayment')}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Method (JazzCash, Easypaisa, Bank Transfer, COD, Card) */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                {t('checkout.selectPayment')}
              </h3>
              <p className="text-xs text-neutral-500">
                Select your preferred Pakistani wallet, direct bank transfer, or Cash on Delivery.
              </p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* JazzCash Button */}
              <button
                type="button"
                onClick={() => setSelectedMethod('jazzcash')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedMethod === 'jazzcash'
                    ? 'border-red-600 bg-red-50/50 shadow-sm ring-1 ring-red-600'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-[11px] flex items-center justify-center">
                    JC
                  </div>
                  {selectedMethod === 'jazzcash' && (
                    <Check className="w-3.5 h-3.5 text-red-600" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-900">{t('checkout.jazzcash')}</span>
                  <span className="text-[10px] text-neutral-500">Mobile Wallet</span>
                </div>
              </button>

              {/* Easypaisa Button */}
              <button
                type="button"
                onClick={() => setSelectedMethod('easypaisa')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedMethod === 'easypaisa'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center">
                    EP
                  </div>
                  {selectedMethod === 'easypaisa' && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-900">{t('checkout.easypaisa')}</span>
                  <span className="text-[10px] text-neutral-500">Instant Push</span>
                </div>
              </button>

              {/* Pakistani Bank Account (IBAN / Raast) */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedMethod === 'bank_transfer'
                    ? 'border-blue-700 bg-blue-50/50 shadow-sm ring-1 ring-blue-700'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-6 h-6 text-blue-700" />
                  {selectedMethod === 'bank_transfer' && (
                    <Check className="w-3.5 h-3.5 text-blue-700" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-900">{t('checkout.bankTransfer')}</span>
                  <span className="text-[10px] text-neutral-500">Meezan / HBL / Raast</span>
                </div>
              </button>

              {/* Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setSelectedMethod('cod')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedMethod === 'cod'
                    ? 'border-neutral-950 bg-neutral-100 shadow-sm ring-1 ring-neutral-950'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Banknote className="w-6 h-6 text-neutral-800" />
                  {selectedMethod === 'cod' && (
                    <Check className="w-3.5 h-3.5 text-neutral-950" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-900">{t('checkout.cod')}</span>
                  <span className="text-[10px] text-neutral-500">Pay at Doorstep</span>
                </div>
              </button>
            </div>

            {/* DETAIL PANEL 1: JazzCash */}
            {selectedMethod === 'jazzcash' && (
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                      JazzCash Online
                    </span>
                    <span className="font-semibold text-neutral-800">
                      Till ID: {JAZZCASH_CONFIG.tillNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">Direct MPIN Prompt</span>
                </div>

                <p className="text-neutral-600 leading-relaxed">
                  Enter your JazzCash registered mobile number below. You will receive an instant push request on your mobile screen to enter your 4-digit MPIN to authorize <strong>{formatPrice(finalTotal)}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      JazzCash Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={jazzcashNumber}
                      onChange={(e) => setJazzcashNumber(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Last 6 Digits of CNIC
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={jazzcashCnic}
                      onChange={(e) => setJazzcashCnic(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL PANEL 2: Easypaisa */}
            {selectedMethod === 'easypaisa' && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px]">
                      Easypaisa Wallet
                    </span>
                    <span className="font-semibold text-neutral-800">
                      Till ID: {EASYPAISA_CONFIG.tillNumber}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">In-App Notification</span>
                </div>

                <p className="text-neutral-600 leading-relaxed">
                  Enter your Easypaisa account number. Once you click "Confirm & Pay", an approval pop-up will appear inside your Easypaisa Mobile App.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Easypaisa Registered Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={easypaisaNumber}
                    onChange={(e) => setEasypaisaNumber(e.target.value)}
                    placeholder="0345-1234567"
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}

            {/* DETAIL PANEL 3: Pakistani Bank Account / Raast */}
            {selectedMethod === 'bank_transfer' && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">
                    Official StyleNest Bank Accounts
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                    Zero Interbank Fees via Raast
                  </span>
                </div>

                {/* Bank Select Tabs */}
                <div className="flex gap-2">
                  {PAKISTAN_BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedBankId === b.id
                          ? 'bg-blue-900 text-white shadow-sm'
                          : 'bg-white border border-blue-200 text-blue-900 hover:bg-blue-100/50'
                      }`}
                    >
                      {b.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Bank Details Display Box */}
                <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-sans">Bank:</span>
                    <strong className="text-neutral-900 font-sans">{currentBank.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-sans">Account Title:</span>
                    <strong className="text-neutral-900 font-sans">{currentBank.accountTitle}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-sans">Account No:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-neutral-900">{currentBank.accountNumber}</strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentBank.accountNumber, 'Account Number')}
                        className="text-neutral-400 hover:text-neutral-800"
                        title="Copy Account Number"
                      >
                        {copiedField === 'Account Number' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-sans">IBAN:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-neutral-900 truncate max-w-[180px]">
                        {currentBank.iban}
                      </strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentBank.iban, 'IBAN')}
                        className="text-neutral-400 hover:text-neutral-800"
                        title="Copy IBAN"
                      >
                        {copiedField === 'IBAN' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-sans">Raast ID:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-emerald-700">{currentBank.raastId}</strong>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentBank.raastId, 'Raast ID')}
                        className="text-neutral-400 hover:text-neutral-800"
                        title="Copy Raast ID"
                      >
                        {copiedField === 'Raast ID' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Your Bank / Sender Account Title
                    </label>
                    <input
                      type="text"
                      value={senderAccountTitle}
                      onChange={(e) => setSenderAccountTitle(e.target.value)}
                      placeholder="e.g. Ahmad Raza"
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Transaction Reference / Slip ID
                    </label>
                    <input
                      type="text"
                      value={bankTransRef}
                      onChange={(e) => setBankTransRef(e.target.value)}
                      placeholder="e.g. FT2409180029"
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL PANEL 4: Cash on Delivery (COD) */}
            {selectedMethod === 'cod' && (
              <div className="p-4 bg-neutral-100 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-900 font-bold">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Doorstep Cash on Delivery Across Pakistan</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">
                  Pay exact amount of <strong>{formatPrice(finalTotal)}</strong> in Pakistani Rupees to the delivery rider upon arrival at {street}, {city}.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Courier tracking link sent via SMS to {phone}</span>
                </div>
              </div>
            )}

            {/* Destination summary */}
            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 flex justify-between items-center">
              <div>
                <span className="font-semibold text-neutral-900">Delivery Address: </span>
                <span>
                  {street}, {city}, {state}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('address')}
                className="text-neutral-900 font-semibold underline ml-2"
              >
                Change
              </button>
            </div>

            {/* Order Price Breakdown in PKR */}
            <div className="p-4 bg-neutral-50 rounded-2xl space-y-1.5 text-xs text-neutral-600 border border-neutral-200">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Pakistan Courier:</span>
                <span>
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700 font-bold">FREE</strong>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Grand Total Due:</span>
                <span className="text-base text-neutral-950">{formatPrice(finalTotal)}</span>
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
                  <span>{t('checkout.processing')}</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('checkout.placeOrder')} ({formatPrice(finalTotal)})</span>
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
                Order Logged & Verified
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-950 mt-2">
                {t('checkout.successTitle')}
              </h3>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                {t('checkout.successMsg')} • <strong>#{completedOrder.id}</strong>
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-neutral-200 pb-2.5">
                <div>
                  <p className="font-semibold text-neutral-900">Destination</p>
                  <p className="text-neutral-500">
                    {completedOrder.shippingAddress.fullName} ({completedOrder.shippingAddress.phone})<br />
                    {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">Payment Channel</p>
                  <p className="font-bold text-emerald-700 uppercase">
                    {completedOrder.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-neutral-900 mb-1.5">Purchased Wardrobe</p>
                <div className="space-y-1 text-neutral-600">
                  {completedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}x {getProductName(it.product)} ({it.selectedSize}, {it.selectedColor.name})
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(
                          (it.product.discountPrice ?? it.product.price) * it.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between font-extrabold text-sm text-neutral-950">
                <span>Total Amount Charged</span>
                <span>{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                {t('checkout.continueShopping')}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
