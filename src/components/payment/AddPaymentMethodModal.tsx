import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Ban as Bank, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<'card' | 'bank_account'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields for card
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Form fields for bank account
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Integrate with Stripe for actual payment method creation
      // For now, we'll just simulate adding a payment method
      const paymentMethod = {
        user_id: user?.id,
        type,
        last_four: type === 'card' 
          ? cardNumber.slice(-4) 
          : accountNumber.slice(-4),
        brand: type === 'card' ? 'Visa' : undefined,
        exp_month: type === 'card' ? parseInt(expiryMonth) : undefined,
        exp_year: type === 'card' ? parseInt(expiryYear) : undefined,
        is_default: false,
        status: 'active'
      };

      const { error: dbError } = await supabase
        .from('payment_methods')
        .insert([paymentMethod]);

      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-dark-surface rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-light/50 hover:text-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-display font-bold text-light mb-6">
              Add Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                className={`p-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
                  type === 'card'
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-dark hover:bg-dark-surface border-2 border-transparent'
                }`}
                onClick={() => setType('card')}
              >
                <CreditCard className={`w-6 h-6 mb-2 ${type === 'card' ? 'text-primary' : 'text-light/50'}`} />
                <span className={type === 'card' ? 'text-primary' : 'text-light/50'}>Credit Card</span>
              </button>
              <button
                className={`p-4 rounded-xl flex flex-col items-center justify-center transition-colors ${
                  type === 'bank_account'
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-dark hover:bg-dark-surface border-2 border-transparent'
                }`}
                onClick={() => setType('bank_account')}
              >
                <Bank className={`w-6 h-6 mb-2 ${type === 'bank_account' ? 'text-primary' : 'text-light/50'}`} />
                <span className={type === 'bank_account' ? 'text-primary' : 'text-light/50'}>Bank Account</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'card' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-light/70 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        Expiry Month
                      </label>
                      <input
                        type="text"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        placeholder="MM"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light/70 mb-2">
                        Expiry Year
                      </label>
                      <input
                        type="text"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                        placeholder="YYYY"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light/70 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="123"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-light/70 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light/70 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="Enter routing number"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {loading ? 'Adding...' : 'Add Payment Method'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};