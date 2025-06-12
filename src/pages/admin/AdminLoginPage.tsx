import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Special case for known admin credentials
      if (email === 'readysetfitrx@gmail.com' && password === '@GetFit2025') {
        console.log('Attempting login for admin user');
        
        try {
          // First sign out any existing session to ensure clean login
          await supabase.auth.signOut();
          
          // Direct authentication with Supabase
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (authError) {
            console.error('Authentication error:', authError);
            setError(`Authentication error: ${authError.message}`);
            setLoading(false);
            return;
          }
          
          // Verify we have a session and user
          if (!data.session || !data.user) {
            console.error('No session or user after login');
            setError('Authentication failed: No session created');
            setLoading(false);
            return;
          }
          
          console.log('Admin authentication successful, user:', data.user.email);
          
          // Force a small delay to ensure auth state updates
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
          
          return;
        } catch (authErr: any) {
          console.error('Auth exception:', authErr);
          setError(`Authentication error: ${authErr?.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }
      
      // For non-admin users
      try {
        // First sign out any existing session
        await supabase.auth.signOut();
        
        // Try to sign in
        await signIn(email, password);
        
        // If we get here, sign in was successful
        // Check if this is an admin account
        if (email !== 'readysetfitrx@gmail.com') {
          setError('This account does not have admin access.');
          setLoading(false);
          await supabase.auth.signOut(); // Sign out non-admin users
          return;
        }
        
        // Admin login successful - add delay to ensure auth state updates
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } catch (signInErr: any) {
        // Handle sign in errors
        if (signInErr.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(signInErr.message || 'Authentication failed');
        }
        setLoading(false);
      }
    } catch (err: any) {
      // Catch any other errors
      setError(`Login error: ${err?.message || 'An unexpected error occurred'}`);
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="https://raw.githubusercontent.com/QRUMN/RSFIMG/main/RSF_IconOnly_FullColor%20(1).png"
            alt="RSF Logo"
            className="w-16 h-16 object-contain mr-4"
          />
          <h1 className="text-3xl font-display font-bold text-light">
            RSF Admin
          </h1>
        </div>

        <div className="bg-dark-surface rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-light mb-6">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-light/70 mb-2">
                Email
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

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
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;