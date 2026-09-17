import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { showToast, applyPromo } = useShop();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setIsSubscribed(true);
    applyPromo('NEST15');
    showToast('Subscribed! 15% discount code NEST15 is now ready to use.', 'success');
  };

  return (
    <section id="newsletter-section" className="py-16 sm:py-20 bg-neutral-100 border-y border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-600 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>StyleNest Private Client Club</span>
        </div>

        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 tracking-tight mb-4">
          Enjoy 15% Off Your First Order
        </h2>

        <p className="text-neutral-600 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          Subscribe for early access to private capsule drops, bespoke styling lookbooks, and private member seasonal invitations.
        </p>

        {isSubscribed ? (
          <div className="max-w-md mx-auto p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">Welcome to StyleNest</h4>
              <p className="text-xs text-neutral-600">
                Check your inbox! You can also use discount code <strong className="text-neutral-950 font-bold">NEST15</strong> at checkout.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3.5 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950 shadow-sm transition-all"
                />
              </div>

              <button
                type="submit"
                id="newsletter-subscribe-btn"
                className="px-6 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 mt-2 text-left font-medium pl-2">{error}</p>
            )}

            <p className="text-[11px] text-neutral-400 mt-3">
              By subscribing you agree to our Terms & Privacy Policy. Unsubscribe anytime with 1 click.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
