'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: {
    label: string;
    value: string;
  }[];
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export function SuccessModal({
  isOpen,
  title,
  message,
  details = [],
  onClose,
  autoClose = true,
  autoCloseTime = 3000,
}: SuccessModalProps) {
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseTime, onClose]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl max-w-md w-full border border-green-200"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-green-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-green-700" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-lg animate-pulse" />
                  <CheckCircle2 className="w-16 h-16 text-green-600 relative" />
                </div>
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-green-900 mb-2">{title}</h2>

              {/* Message */}
              <p className="text-gray-700 mb-6">{message}</p>

              {/* Details */}
              {details.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/60 rounded-lg p-4 mb-6 space-y-3 border border-green-200"
                >
                  {details.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">{detail.label}:</span>
                      <span className="text-green-700 font-bold">{detail.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                ¡Perfecto!
              </motion.button>

              {/* Auto-close indicator */}
              {autoClose && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: autoCloseTime / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1 bg-green-600 origin-left rounded-b-2xl"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
