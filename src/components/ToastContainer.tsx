import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4"
    >
      <AnimatePresence>
        {toasts.map(toast => {
          let Icon = CheckCircle2;
          let borderClass = 'border-emerald-700/30 bg-neutral-900 text-white';
          let iconClass = 'text-emerald-400';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-rose-700/30 bg-neutral-900 text-white';
            iconClass = 'text-rose-400';
          } else if (toast.type === 'info') {
            Icon = Info;
            borderClass = 'border-amber-700/30 bg-neutral-900 text-white';
            iconClass = 'text-amber-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md ${borderClass}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconClass}`} />
                <p className="text-sm font-medium tracking-tight leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-white transition-colors p-1 -mr-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
