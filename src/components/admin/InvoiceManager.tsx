import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Plus, Edit, Eye, MoreHorizontal, Download, Send, Check, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Invoice } from '../../types/invoice';
import InvoiceCreator from './InvoiceCreator';

interface InvoiceManagerProps {
  onCreateNew?: () => void;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ onCreateNew }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data as Invoice[] || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format status for display
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string }> = {
      draft: { color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
      sent: { color: 'text-blue-400', bg: 'bg-blue-400/20' },
      paid: { color: 'text-green-400', bg: 'bg-green-400/20' },
      overdue: { color: 'text-red-400', bg: 'bg-red-400/20' },
      cancelled: { color: 'text-gray-400', bg: 'bg-gray-400/20' },
    };
    
    const style = statusMap[status] || { color: 'text-light/70', bg: 'bg-dark' };
    
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.color} ${style.bg}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleActionClick = (invoiceId: string, action: string) => {
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        // View invoice details (implement this)
        console.log('View invoice', invoiceId);
        break;
      case 'edit':
        // Edit invoice (implement this)
        console.log('Edit invoice', invoiceId);
        break;
      case 'download':
        // Download invoice as PDF (implement this)
        console.log('Download invoice', invoiceId);
        break;
      case 'send':
        // Send invoice by email (implement this)
        console.log('Send invoice', invoiceId);
        break;
      case 'mark-paid':
        updateInvoiceStatus(invoiceId, 'paid');
        break;
      case 'mark-cancelled':
        updateInvoiceStatus(invoiceId, 'cancelled');
        break;
      default:
        break;
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status,
          ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {})
        })
        .eq('id', invoiceId);
      
      if (error) throw error;
      
      // Update local state
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) } 
            : invoice
        )
      );
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleCreateInvoice = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setShowCreator(true);
    }
  };

  const handleInvoiceSaved = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    setShowCreator(false);
  };

  if (showCreator) {
    return (
      <InvoiceCreator
        onClose={() => setShowCreator(false)}
        onSaved={handleInvoiceSaved}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-light">
          Invoices
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices..."
              className="bg-dark border border-primary/20 rounded-lg py-2 pl-9 pr-3 text-light placeholder-light/30 focus:outline-none focus:border-primary w-full sm:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light/50" />
          </div>
          <Button
            variant="primary"
            onClick={handleCreateInvoice}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-light mb-2">
                No Invoices Found
              </h3>
              <p className="text-light/70 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first invoice'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={handleCreateInvoice}
                  className="flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Create New Invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-light/70 text-left border-b border-primary/10">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-4">
                        <span className="font-medium text-primary">
                          {invoice.invoice_number}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-light">{invoice.client_name}</div>
                        <div className="text-sm text-light/70">{invoice.client_email}</div>
                      </td>
                      <td className="py-4">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="py-4">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="py-4">
                        <div className="capitalize">
                          {invoice.template_type.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-medium">${invoice.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === invoice.id ? null : invoice.id || null)}
                            className="text-light/50 hover:text-primary p-1 transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {activeDropdown === invoice.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-dark-surface border border-primary/20 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleActionClick(invoice.id || '', 'view')}
                                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-light/70 hover:text-light transition-colors"
                                >
                                  <Eye className="w-4 h-4" /> View Details
                                </button>
                                {invoice.status === 'draft' && (
                                  <button
                                    onClick={() => handleActionClick(invoice.id || '', 'edit')}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-light/70 hover:text-light transition-colors"
                                  >
                                    <Edit className="w-4 h-4" /> Edit
                                  </button>
                                )}
                                <button
                                  onClick={() => handleActionClick(invoice.id || '', 'download')}
                                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-light/70 hover:text-light transition-colors"
                                >
                                  <Download className="w-4 h-4" /> Download PDF
                                </button>
                                <button
                                  onClick={() => handleActionClick(invoice.id || '', 'send')}
                                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-light/70 hover:text-light transition-colors"
                                >
                                  <Send className="w-4 h-4" /> Send Email
                                </button>
                                <div className="border-t border-primary/10 my-1"></div>
                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleActionClick(invoice.id || '', 'mark-paid')}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-green-400 hover:text-green-500 transition-colors"
                                  >
                                    <Check className="w-4 h-4" /> Mark as Paid
                                  </button>
                                )}
                                {invoice.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleActionClick(invoice.id || '', 'mark-cancelled')}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-primary/10 text-red-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" /> Cancel Invoice
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default InvoiceManager;
