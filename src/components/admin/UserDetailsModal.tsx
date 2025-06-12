import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { Loader, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in?: string;
  status?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdated 
}) => {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [status, setStatus] = useState(user?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form values when user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setStatus(user.status || 'active');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          status: status
        })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      setSuccess(true);
      onUserUpdated();
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the user');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details">
      {!user ? (
        <div className="text-center py-6 text-light/50">
          No user selected
        </div>
      ) : success ? (
        <div className="text-center py-6">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-light mb-2">User Updated Successfully</h3>
        </div>
      ) : (
        <div>
          {/* User Info Section */}
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-sm font-medium text-light/70 mb-2">User Information</h4>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <span className="text-sm text-light/50">Email:</span>
                <span className="ml-2 text-light">{user.email}</span>
              </div>
              <div>
                <span className="text-sm text-light/50">User ID:</span>
                <span className="ml-2 text-light text-xs font-mono">{user.id}</span>
              </div>
              <div>
                <span className="text-sm text-light/50">Joined:</span>
                <span className="ml-2 text-light">{formatDate(user.created_at)}</span>
              </div>
              {user.last_sign_in && (
                <div>
                  <span className="text-sm text-light/50">Last Sign In:</span>
                  <span className="ml-2 text-light">{formatDate(user.last_sign_in)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-sm text-red-400 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
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
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="status" className="block mb-2 text-sm font-medium text-light">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailsModal;
