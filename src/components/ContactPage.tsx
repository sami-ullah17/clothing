import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    q: 'What payment methods do you accept in Pakistan?',
    a: 'We accept JazzCash mobile accounts, Easypaisa wallet, Raast Instant Transfers, direct online Bank Transfers (Meezan Bank, HBL, MCB, Bank Alfalah, etc.), Credit/Debit cards, and Cash on Delivery (COD) across all cities.',
  },
  {
    q: 'What is your return & exchange policy?',
    a: 'We offer hassle-free 14-day exchanges for all unworn garments with original tags attached. We provide doorstep exchange pickup via our courier partners (TCS & Leopards) in all major cities.',
  },
  {
    q: 'How long does delivery take across Pakistan?',
    a: 'Standard courier delivery takes 2-4 business days across Pakistan. Same-day or next-day express delivery is available for orders within Lahore, Karachi, and Islamabad / Rawalpindi.',
  },
  {
    q: 'Are your fabrics authentic and high-quality?',
    a: 'Yes. StyleNest sources premium natural fibers including combed Egyptian cotton, hand-spun wool, raw silk, and artisanal linens crafted to international luxury specifications.',
  },
];

export const ContactPage: React.FC = () => {
  const { showToast, t, isRTL } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Product Sizing & Fit');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitted(true);
    showToast('Inquiry received! Our concierge will respond within 24 hours.', 'success');
  };

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Client Care
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 mt-1 mb-4">
          {t('contact.title')}
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      {/* Grid: Details + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{t('contact.concierge')}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl font-bold">
              We're here to assist your styling journey.
            </h3>

            <div className="space-y-4 text-sm text-neutral-300 pt-2">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{t('contact.flagship')}</p>
                  <p className="text-neutral-400">M.M. Alam Road, Gulberg III, Lahore, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Direct WhatsApp & Helpline</p>
                  <p className="text-neutral-400">+92 (042) 111-NEST • Mon-Sat 9AM-8PM PKT</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Direct Email</p>
                  <p className="text-neutral-400">concierge@stylenest.pk</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Express Nationwide Dispatch</p>
                  <p className="text-neutral-400">Daily shipping via TCS, Leopards & Trax</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900">
                Message Successfully Received
              </h3>
              <p className="text-neutral-600 text-sm max-w-md mx-auto">
                Thank you for reaching out, {name}. A member of our styling concierge has been notified and will reply to <strong>{email}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                  setName('');
                  setEmail('');
                }}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900 mb-2">
                {t('contact.sendInquiry')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {t('contact.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    {t('contact.subject')}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950 bg-white"
                  >
                    <option value="Product Sizing & Fit">Product Sizing & Fit</option>
                    <option value="Order Tracking & Status">Order Tracking & Status</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Fabric & Material Care">Fabric & Material Care</option>
                    <option value="Private VIP Styling">Private VIP Styling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. SN-582910"
                    className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  {t('contact.message')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today? Let us know any specific sizing questions or styling needs..."
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-950"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>{t('contact.submit')}</span>
                <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="border-t border-neutral-200 pt-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Self-Service Help
          </span>
          <h2 className="font-serif-luxury text-3xl font-bold text-neutral-950 mt-1">
            {t('contact.faq')}
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-neutral-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-neutral-950' : ''
                    }`}
                  />
                </button>
                  <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
