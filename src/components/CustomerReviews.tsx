import React from 'react';
import { useShop } from '../context/ShopContext';
import { TESTIMONIALS_DATA } from '../data/products';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { motion } from 'motion/react';

export const CustomerReviews: React.FC = () => {
  const { t } = useShop();

  return (
    <section id="customer-reviews-section" className="py-20 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            {t('reviews.tag')}
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 mt-1">
            {t('reviews.title')}
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mt-3 leading-relaxed">
            {t('reviews.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS_DATA.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-neutral-200" />
                </div>

                <p className="text-neutral-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  "{testimonial.quote}"
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-neutral-900">{testimonial.name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" title="Verified Customer" />
                    </div>
                    <p className="text-xs text-neutral-400">{testimonial.role}</p>
                  </div>
                </div>

                <div className="mt-3 bg-neutral-50 px-3 py-1.5 rounded-lg text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-700">{t('reviews.verified')}:</span>
                  <span className="truncate">{testimonial.item}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
