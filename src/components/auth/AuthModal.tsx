import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'sign-in' | 'sign-up';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState(initialMode);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'sign-up') {
        const passwordError = validatePassword();
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        await signUp(email, password);
        onClose();
        navigate('/onboarding');
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }
        onClose();
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('invalid_credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up');
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/95 backdrop-blur-lg"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-dark-surface rounded-2xl shadow-xl p-6 mx-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-light/50 hover:text-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-display font-bold text-light mb-6">
              {mode === 'sign-up' ? 'Create Account' : 'Welcome back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-12 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light/50 hover:text-light transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'sign-up' && (
                <div>
                  <label className="block text-sm font-medium text-light/70 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-12 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                      placeholder="Confirm your password"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {passwordsMatch && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-light/50 hover:text-light transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : mode === 'sign-up' ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-light/50">
              {mode === 'sign-up' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};