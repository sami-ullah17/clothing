import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { User as UserIcon, Lock, Mail, CheckCircle2, X, PackageCheck, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, login, logout, showToast } = useShop();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
    login(email.trim(), displayName);
  };

  const handleDemoLogin = () => {
    login('claire.sterling@stylenest.com', 'Claire Sterling');
    showToast('Signed in with Demo VIP Account!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
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
              {user ? 'My StyleNest Account' : tab === 'login' ? 'Client Sign In' : 'Create Account'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-950 rounded-full"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          /* User Profile View */
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3.5 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-neutral-900 truncate">{user.name}</h4>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                  Private Member Tier
                </span>
              </div>
            </div>

            {/* Order History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Your Orders ({user.orders.length})</span>
                </h5>
              </div>

              {user.orders.length === 0 ? (
                <p className="text-xs text-neutral-500 bg-neutral-50 p-4 rounded-xl text-center">
                  No orders placed yet. Your order history will appear here once you checkout!
                </p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {user.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center font-semibold text-neutral-900">
                        <span>Order #{ord.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Placed: {ord.date}</span>
                        <span className="font-bold text-neutral-900">${ord.total.toFixed(2)}</span>
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
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-6">
            {/* Tab switch */}
            <div className="flex rounded-xl bg-neutral-100 p-1 mb-6">
              <button
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tab === 'login' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setTab('register');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  tab === 'register' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Claire Sterling"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                {tab === 'login' ? 'Sign In to StyleNest' : 'Complete Registration'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-400 font-semibold">Or Quick Access</span>
              </div>
            </div>

            {/* Demo One-Click Login */}
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              <span>Instant VIP Demo Login</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
