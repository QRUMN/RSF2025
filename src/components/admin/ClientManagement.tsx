import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Search, UserPlus, Edit, RefreshCw } from 'lucide-react';
import AddClientModal from './AddClientModal';
import ClientDetailsModal from './ClientDetailsModal';

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
}

interface ClientManagementProps {
  clients: Client[];
  loading: boolean;
  onRefresh: () => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsModalOpen(true);
  };
  
  const filteredClients = clients.filter(client => 
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
          <h2 className="text-xl font-semibold text-light">Client Management</h2>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <input
                type="text"
                placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            
            <button
              className="p-2 bg-gray-700 text-light rounded-lg hover:bg-gray-600 transition-colors"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              onClick={() => setIsAddClientModalOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Membership</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider">Last Session</th>
                <th className="px-4 py-3 text-xs font-medium text-light/70 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-light/50">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      Loading clients...
                    </div>
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                    onClick={() => handleClientClick(client)}
                  >
                    <td className="px-4 py-3 text-sm text-light">{client.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-light">{client.email}</td>
                    <td className="px-4 py-3 text-sm text-light/70">{client.phone || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-light/70">{client.membership_type || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.membership_status === 'active' ? 'bg-green-500/20 text-green-400' :
                        client.membership_status === 'expired' ? 'bg-red-500/20 text-red-400' :
                        client.membership_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {client.membership_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-light/70">
                      {client.last_session 
                        ? new Date(client.last_session).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        className="text-light/50 hover:text-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientClick(client);
                        }}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-light/50">
                    {searchTerm ? 'No clients match your search.' : 'No clients found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
        onClientAdded={onRefresh} 
      />
      
      {/* Client Details Modal */}
      <ClientDetailsModal
        isOpen={isClientDetailsModalOpen}
        onClose={() => setIsClientDetailsModalOpen(false)}
        client={selectedClient}
        onClientUpdated={onRefresh}
      />
    </div>
  );
};

export default ClientManagement;
