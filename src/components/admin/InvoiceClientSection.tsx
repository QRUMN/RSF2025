import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface InvoiceClientSectionProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  clients: any[];
  loadingClients: boolean;
  onSelectClient: (clientId: string) => void;
}

const InvoiceClientSection: React.FC<InvoiceClientSectionProps> = ({
  invoice,
  setInvoice,
  clients,
  loadingClients,
  onSelectClient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };

  const filteredClients = searchQuery
    ? clients.filter(client => 
        client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  return (
    <div className="space-y-4 pt-4 border-t border-primary/10">
      <h3 className="font-medium text-light/70">Client Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="relative">
            <label className="block text-light/70 text-sm mb-1">
              Client Name
            </label>
            <div className="flex">
              <input
                type="text"
                name="client_name"
                value={invoice.client_name}
                onChange={handleInputChange}
                onClick={() => setShowClientDropdown(true)}
                className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                placeholder="Client name"
              />
              <div className="absolute right-3 top-9 text-light/50">
                <Search className="w-4 h-4" />
              </div>
            </div>
            
            {/* Client search dropdown */}
            {showClientDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-dark-surface border border-primary/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-dark-surface border-b border-primary/10">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark border border-primary/20 rounded py-1 px-2 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                    placeholder="Search clients..."
                    autoFocus
                  />
                </div>
                
                <div>
                  {loadingClients ? (
                    <div className="p-4 text-center text-light/50">
                      Loading clients...
                    </div>
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.user_id}
                        className="p-2 hover:bg-primary/10 cursor-pointer transition-colors"
                        onClick={() => {
                          onSelectClient(client.user_id);
                          setShowClientDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="font-medium text-light">{client.full_name}</div>
                        <div className="text-sm text-light/70">{client.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-light/50">
                      No clients found
                    </div>
                  )}
                </div>
                
                <div className="p-2 sticky bottom-0 bg-dark-surface border-t border-primary/10">
                  <button
                    onClick={() => setShowClientDropdown(false)}
                    className="w-full text-sm text-center text-primary hover:text-primary/80 py-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-light/70 text-sm mb-1">
              Client Email
            </label>
            <input
              type="email"
              name="client_email"
              value={invoice.client_email}
              onChange={handleInputChange}
              className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light placeholder-light/30 focus:outline-none focus:border-primary"
              placeholder="client@example.com"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-light/70 text-sm mb-1">
              Client Address
            </label>
            <textarea
              name="client_address"
              value={invoice.client_address || ''}
              onChange={handleInputChange}
              className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light placeholder-light/30 focus:outline-none focus:border-primary"
              rows={3}
              placeholder="Street address, city, state, postal code"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-light/70 text-sm mb-1">
            Invoice Date
          </label>
          <input
            type="date"
            name="invoice_date"
            value={invoice.invoice_date}
            onChange={handleInputChange}
            className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-light/70 text-sm mb-1">
            Due Date
          </label>
          <input
            type="date"
            name="due_date"
            value={invoice.due_date}
            onChange={handleInputChange}
            className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceClientSection;
