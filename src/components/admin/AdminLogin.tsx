import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { adminLogin, settings } = useShop();
  const [email, setEmail] = useState('admin@pri-buteeq.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await adminLogin(email.trim(), password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@pri-buteeq.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950 opacity-70 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Return to store button */}
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Customer Storefront</span>
        </button>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {settings.storeName} Owner Portal
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5">
              Secure single-owner administration & inventory console
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Owner Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pri-buteeq.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Owner Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Owner Testing */}
          <div className="mt-8 pt-6 border-t border-neutral-800/80">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pre-configured Owner Account</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] font-bold text-amber-400 hover:underline uppercase tracking-wider"
                >
                  Auto Fill
                </button>
              </div>
              <div className="font-mono text-xs text-neutral-300 space-y-1">
                <div>
                  <span className="text-neutral-500">Email:</span> admin@pri-buteeq.com
                </div>
                <div>
                  <span className="text-neutral-500">Password:</span> admin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
