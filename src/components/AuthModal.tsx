import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PAKISTAN_CITIES } from '../data/products';
import {
  User as UserIcon,
  Lock,
  Mail,
  CheckCircle2,
  X,
  PackageCheck,
  LogOut,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, login, logout, formatPrice, showToast, t, isRTL } =
    useShop();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0300-1234567');
  const [city, setCity] = useState('Lahore');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError('');
    const displayName = tab === 'register' ? name.trim() : email.split('@')[0];
    login(email.trim(), displayName, phone.trim(), city);
  };

  const handleDemoLogin = (demoName: string, demoEmail: string, demoPhone: string, demoCity: string) => {
    login(demoEmail, demoName, demoPhone, demoCity);
    showToast(`Signed in as ${demoName} (${demoCity})!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-neutral-950" />
            <h3 className="font-serif-luxury text-xl font-bold text-neutral-950">
              {user ? 'My Pri-Boutique Account' : tab === 'login' ? t('auth.signIn') : t('auth.register')}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          /* User Profile View */
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-neutral-900 truncate">{user.name}</h4>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-600">
                  <span>🇵🇰 {user.phone || '0300-1234567'}</span>
                  <span>•</span>
                  <span>{user.city || 'Pakistan'}</span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Order History ({user.orders.length})</span>
                </h5>
              </div>

              {user.orders.length === 0 ? (
                <p className="text-xs text-neutral-500 bg-neutral-50 p-4 rounded-xl text-center">
                  No orders placed yet. Your Pakistani orders (JazzCash / Easypaisa / Bank / COD) will appear here.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {user.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 border border-neutral-200 rounded-xl bg-neutral-50/70 space-y-1.5 text-xs"
                    >
                      <div className="flex justify-between items-center font-semibold text-neutral-900">
                        <span>Order #{ord.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-500 text-[11px]">
                        <span>Payment: {ord.paymentMethod?.toUpperCase() || 'PAID'}</span>
                        <span className="font-bold text-neutral-900">{formatPrice(ord.total)}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 truncate">
                        {ord.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => {
                  logout();
                  setIsAuthModalOpen(false);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 py-2 px-3 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                <span>Sign Out</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="px-5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-6">
            {/* Tab switch */}
            <div className="flex rounded-xl bg-neutral-100 p-1 mb-5">
              <button
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {t('auth.signIn')}
              </button>
              <button
                onClick={() => {
                  setTab('register');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tab === 'register'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {t('auth.register')}
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-4">
              {tab === 'login' ? t('auth.signInDesc') : t('auth.registerDesc')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {t('checkout.fullName')}
                    </label>
                    <div className="relative">
                      <UserIcon className={`w-4 h-4 text-neutral-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ayesha Malik"
                        className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {t('checkout.phone')}
                      </label>
                      <div className="relative">
                        <Phone className={`w-3.5 h-3.5 text-neutral-400 absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2`} />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0300-1234567"
                          className={`w-full ${isRTL ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'} py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {t('checkout.city')}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                      >
                        {PAKISTAN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('checkout.email')}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-neutral-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.pk"
                    className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-neutral-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950`}
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-1"
              >
                {tab === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-400 font-semibold text-[10px]">
                  {t('auth.demoAccounts')}
                </span>
              </div>
            </div>

            {/* Quick Demo Logins for Pakistan testing */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  handleDemoLogin(
                    'Ayesha Malik',
                    'ayesha.malik@pri-boutique.com',
                    '0300-1122334',
                    'Lahore'
                  )
                }
                className="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-[11px] font-bold text-center transition-colors"
              >
                <span>Ayesha Malik</span>
                <span className="block text-[9px] font-normal text-amber-700">Lahore</span>
              </button>

              <button
                onClick={() =>
                  handleDemoLogin(
                    'Hamza Tariq',
                    'hamza.tariq@pri-boutique.com',
                    '0333-5566778',
                    'Islamabad'
                  )
                }
                className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-[11px] font-bold text-center transition-colors"
              >
                <span>Hamza Tariq</span>
                <span className="block text-[9px] font-normal text-emerald-700">Islamabad</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
