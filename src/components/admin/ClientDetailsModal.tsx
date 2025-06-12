import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { Loader, AlertCircle, Calendar } from 'lucide-react';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status?: string;
  created_at: string;
  last_session?: string;
  membership_type?: string;
  membership_status?: string;
  notes?: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  client, 
  onClientUpdated 
}) => {
  const [fullName, setFullName] = useState(client?.full_name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [membershipType, setMembershipType] = useState(client?.membership_type || 'monthly');
  const [membershipStatus, setMembershipStatus] = useState(client?.membership_status || 'active');
  const [notes, setNotes] = useState(client?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form values when client changes
  useEffect(() => {
    if (client) {
      setFullName(client.full_name || '');
      setPhone(client.phone || '');
      setMembershipType(client.membership_type || 'monthly');
      setMembershipStatus(client.membership_status || 'active');
      setNotes(client.notes || '');
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update client in clients table
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          full_name: fullName,
          phone,
          membership_type: membershipType,
          membership_status: membershipStatus,
          notes
        })
        .eq('id', client.id);

      if (updateError) throw new Error(updateError.message);

      setSuccess(true);
      onClientUpdated();
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the client');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Client Details" size="lg">
      {!client ? (
        <div className="text-center py-6 text-light/50">
          No client selected
        </div>
      ) : success ? (
        <div className="text-center py-6">
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-light mb-2">Client Updated Successfully</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
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
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-light">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="membershipType" className="block mb-2 text-sm font-medium text-light">
                    Membership Type
                  </label>
                  <select
                    id="membershipType"
                    value={membershipType}
                    onChange={(e) => setMembershipType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="trial">Free Trial</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="membershipStatus" className="block mb-2 text-sm font-medium text-light">
                    Membership Status
                  </label>
                  <select
                    id="membershipStatus"
                    value={membershipStatus}
                    onChange={(e) => setMembershipStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block mb-2 text-sm font-medium text-light">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Add any notes about this client..."
                ></textarea>
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
          
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-light/70 mb-4 border-b border-gray-700 pb-2">Client Information</h4>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-light/50 block">Email</span>
                <span className="text-light">{client.email}</span>
              </div>
              
              <div>
                <span className="text-xs text-light/50 block">Client ID</span>
                <span className="text-light text-xs font-mono">{client.id}</span>
              </div>
              
              <div>
                <span className="text-xs text-light/50 block">Client Since</span>
                <span className="text-light">{formatDate(client.created_at)}</span>
              </div>
              
              {client.last_session && (
                <div>
                  <span className="text-xs text-light/50 block">Last Session</span>
                  <span className="text-light">{formatDate(client.last_session)}</span>
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t border-gray-700">
                <button 
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-light rounded-md transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    // This would open a session scheduling modal in a real implementation
                    alert('Schedule session functionality would go here');
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ClientDetailsModal;
