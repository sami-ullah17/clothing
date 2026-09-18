import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { adminLogin, settings } = useShop();
  const [email, setEmail] = useState('admin@pri-boutique.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await adminLogin(email.trim(), password.trim());
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleInstantLogin = async () => {
    setError('');
    setIsLoading(true);
    setEmail('admin@pri-boutique.com');
    setPassword('admin123');
    const res = await adminLogin('admin@pri-boutique.com', 'admin123');
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed. Please retry.');
    }
  };

  const handleQuickFill = (presetEmail: string = 'admin@pri-boutique.com') => {
    setEmail(presetEmail);
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
            <div className="mb-6 p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleInstantLogin}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg text-[11px] font-bold underline"
                >
                  Click Here for 1-Click Instant Owner Login
                </button>
              </div>
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
                  placeholder="admin@pri-boutique.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                <span>Accepted:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@pri-boutique.com')}
                  className="text-amber-400 hover:underline"
                >
                  admin@pri-boutique.com
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sami1717sp@gmail.com')}
                  className="text-amber-400 hover:underline"
                >
                  sami1717sp@gmail.com
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Default Password: <span className="font-mono text-amber-400 font-bold">admin123</span>
              </p>
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

          {/* Instant 1-Click Login Card for Owner */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={handleInstantLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1-Click Instant Login as Owner</span>
            </button>

            <div className="mt-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Working Credentials:</span>
              </div>
              <div><span className="text-neutral-500">Username/Email:</span> <span className="font-mono text-white">admin@pri-boutique.com</span> or <span className="font-mono text-white">sami1717sp@gmail.com</span> or <span className="font-mono text-white">admin</span></div>
              <div><span className="text-neutral-500">Password:</span> <span className="font-mono text-white">admin123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
