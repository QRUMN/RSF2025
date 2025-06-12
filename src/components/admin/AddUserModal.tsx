import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { Loader } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw new Error(authError.message);

      // Add user to profiles table if needed
      // In most cases, this is handled by Supabase triggers, but we can ensure it here
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            status: 'active'
          });

        if (profileError) throw new Error(profileError.message);
      }

      setSuccess(true);
      // Reset form
      setEmail('');
      setFullName('');
      setPassword('');
      
      // Notify parent component
      onUserAdded();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      {success ? (
        <div className="text-center py-6">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-light mb-2">User Added Successfully</h3>
          <p className="text-gray-400">The user has been created and can now log in.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-sm text-red-400">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-light">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-light">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-light">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-400">Password must be at least 8 characters long.</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-light rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddUserModal;
