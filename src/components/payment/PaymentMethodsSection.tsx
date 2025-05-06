import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Ban as Bank, Plus, Trash2, Check } from 'lucide-react';
import { Section } from '../ui/Section';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last_four: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  status: 'active' | 'expired' | 'cancelled';
}

export const PaymentMethodsSection: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, remove default from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected one as default
      await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from('payment_methods')
        .update({ status: 'cancelled' })
        .eq('id', id);

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  return (
    <>
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold text-light">
              Payment Methods
            </h2>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Payment Method
            </Button>
          </div>

          {loading ? (
            <p className="text-light/70">Loading payment methods...</p>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card hover className="relative">
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {method.type === 'card' ? (
                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-primary" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                              <Bank className="w-6 h-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-light">
                              {method.type === 'card' ? (
                                <>
                                  {method.brand} •••• {method.last_four}
                                  {method.exp_month && method.exp_year && (
                                    <span className="text-light/50 ml-2">
                                      Expires {method.exp_month}/{method.exp_year}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>Bank Account •••• {method.last_four}</>
                              )}
                            </h3>
                            {method.is_default && (
                              <span className="text-sm text-primary">Default</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              <Check className="w-4 h-4" />
                              <span className="ml-2">Set Default</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(method.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-light mb-2">
                  No Payment Methods
                </h3>
                <p className="text-light/70 mb-6">
                  Add a payment method to manage your subscription and payments.
                </p>
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Payment Method
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </Section>

      <AddPaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPaymentMethods}
      />
    </>
  );
};