import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

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
      // First sign in - safely handle the response
      const signInResult = await signIn(email, password);
      const signInError = signInResult?.error;

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Get the signed-in user's ID from Auth
      const user = signInResult?.data?.user;
      if (!user) {
        setError('Failed to retrieve user information.');
        setLoading(false);
        return;
      }

      // Then check if user is admin by fetching their profile and checking role
      const allowedRoles = ['superadmin', 'admin', 'site_manager'];
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile query error:', profileError); // DEBUG LOG
        setError('An error occurred while verifying admin access.');
        setLoading(false);
        return;
      }

      if (!profile || !allowedRoles.includes(profile.role)) {
        setError('You do not have permission to access the admin dashboard.');
        setLoading(false);
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
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