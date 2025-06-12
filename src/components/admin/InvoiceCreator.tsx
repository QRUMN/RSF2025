import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Save, 
  Send, 
  ArrowLeft,
  FileDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, addDays } from 'date-fns';
import { Invoice, InvoiceItem, InvoiceTemplateType, INVOICE_TEMPLATES } from '../../types/invoice';
import InvoiceTemplateSelector from './InvoiceTemplateSelector';
import InvoiceItemsList from './InvoiceItemsList';
import InvoiceClientSection from './InvoiceClientSection';

interface InvoiceCreatorProps {
  onClose?: () => void;
  onSaved?: (invoice: Invoice) => void;
}

const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({ onClose, onSaved }) => {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice>({
    client_name: '',
    client_email: '',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    status: 'draft',
    template_type: 'personal_training',
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    items: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Fetch clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Recalculate totals whenever items, tax rate, or discount changes
  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.tax_rate, invoice.discount_amount]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, address')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSelectClient = (clientId: string) => {
    const selectedClient = clients.find(client => client.user_id === clientId);
    if (selectedClient) {
      setInvoice(prev => ({
        ...prev,
        client_id: selectedClient.user_id,
        client_name: selectedClient.full_name,
        client_email: selectedClient.email,
        client_address: selectedClient.address || ''
      }));
    }
  };

  const handleTemplateChange = (templateType: InvoiceTemplateType) => {
    const selectedTemplate = INVOICE_TEMPLATES.find(t => t.type === templateType);
    if (selectedTemplate) {
      setInvoice(prev => ({
        ...prev,
        template_type: templateType,
        notes: selectedTemplate.defaultNotes || prev.notes,
        terms: selectedTemplate.defaultTerms || prev.terms,
        tax_rate: selectedTemplate.defaultTaxRate !== undefined ? selectedTemplate.defaultTaxRate : prev.tax_rate,
        items: selectedTemplate.defaultItems.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          amount: item.amount || 0
        }))
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * invoice.tax_rate) / 100;
    const total = subtotal + taxAmount - invoice.discount_amount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total > 0 ? total : 0
    }));
  };

  const handleDownloadInvoice = () => {
    if (!invoice.client_name || invoice.items.length === 0) {
      alert('Please add client information and at least one item before downloading');
      return;
    }
    
    // Create a printable version of the invoice
    const invoiceContent = document.createElement('div');
    invoiceContent.style.padding = '40px';
    invoiceContent.style.fontFamily = 'Arial, sans-serif';
    invoiceContent.style.color = '#333';
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '30px';
    
    const companyInfo = document.createElement('div');
    companyInfo.innerHTML = `
      <h1 style="margin: 0; color: #6C5CE7;">Ready Set Fitness</h1>
      <p style="margin: 5px 0;">123 Fitness Way</p>
      <p style="margin: 5px 0;">Exercise City, EC 12345</p>
      <p style="margin: 5px 0;">Phone: (555) 123-4567</p>
      <p style="margin: 5px 0;">Email: admin@readysetfitness.com</p>
    `;
    
    const invoiceInfo = document.createElement('div');
    invoiceInfo.style.textAlign = 'right';
    invoiceInfo.innerHTML = `
      <h2 style="margin: 0; color: #6C5CE7;">INVOICE</h2>
      <p style="margin: 5px 0;"><strong>Invoice #:</strong> ${invoice.invoice_number || 'DRAFT'}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${invoice.invoice_date}</p>
      <p style="margin: 5px 0;"><strong>Due Date:</strong> ${invoice.due_date}</p>
    `;
    
    header.appendChild(companyInfo);
    header.appendChild(invoiceInfo);
    invoiceContent.appendChild(header);
    
    // Client Info
    const clientInfo = document.createElement('div');
    clientInfo.style.marginBottom = '30px';
    clientInfo.style.padding = '15px';
    clientInfo.style.backgroundColor = '#f8f9fa';
    clientInfo.style.borderRadius = '5px';
    
    clientInfo.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #6C5CE7;">Bill To:</h3>
      <p style="margin: 5px 0;"><strong>${invoice.client_name}</strong></p>
      <p style="margin: 5px 0;">${invoice.client_email}</p>
      <p style="margin: 5px 0;">${invoice.client_address || ''}</p>
    `;
    
    invoiceContent.appendChild(clientInfo);
    
    // Items Table
    const itemsTable = document.createElement('table');
    itemsTable.style.width = '100%';
    itemsTable.style.borderCollapse = 'collapse';
    itemsTable.style.marginBottom = '30px';
    
    // Table Header
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
      <tr style="background-color: #6C5CE7; color: white;">
        <th style="padding: 10px; text-align: left;">Description</th>
        <th style="padding: 10px; text-align: right;">Quantity</th>
        <th style="padding: 10px; text-align: right;">Unit Price</th>
        <th style="padding: 10px; text-align: right;">Amount</th>
      </tr>
    `;
    
    // Table Body
    const tableBody = document.createElement('tbody');
    invoice.items.forEach((item: InvoiceItem) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #dee2e6';
      
      row.innerHTML = `
        <td style="padding: 10px;">${item.description}</td>
        <td style="padding: 10px; text-align: right;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 10px; text-align: right;">$${item.amount.toFixed(2)}</td>
      `;
      
      tableBody.appendChild(row);
    });
    
    itemsTable.appendChild(tableHeader);
    itemsTable.appendChild(tableBody);
    invoiceContent.appendChild(itemsTable);
    
    // Totals
    const totalsSection = document.createElement('div');
    totalsSection.style.marginLeft = 'auto';
    totalsSection.style.width = '300px';
    
    totalsSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; padding: 5px 0;">
        <span>Subtotal:</span>
        <span>$${invoice.subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 5px 0;">
        <span>Tax (${invoice.tax_rate}%):</span>
        <span>$${invoice.tax_amount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 5px 0;">
        <span>Discount:</span>
        <span>$${invoice.discount_amount.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; border-top: 2px solid #dee2e6; margin-top: 10px;">
        <span>Total:</span>
        <span>$${invoice.total_amount.toFixed(2)}</span>
      </div>
    `;
    
    invoiceContent.appendChild(totalsSection);
    
    // Notes and Terms
    if (invoice.notes || invoice.terms) {
      const notesSection = document.createElement('div');
      notesSection.style.marginTop = '30px';
      notesSection.style.padding = '15px';
      notesSection.style.backgroundColor = '#f8f9fa';
      notesSection.style.borderRadius = '5px';
      
      if (invoice.notes) {
        const notes = document.createElement('div');
        notes.style.marginBottom = '15px';
        notes.innerHTML = `
          <h4 style="margin: 0 0 5px 0; color: #6C5CE7;">Notes:</h4>
          <p style="margin: 0;">${invoice.notes}</p>
        `;
        notesSection.appendChild(notes);
      }
      
      if (invoice.terms) {
        const terms = document.createElement('div');
        terms.innerHTML = `
          <h4 style="margin: 0 0 5px 0; color: #6C5CE7;">Terms and Conditions:</h4>
          <p style="margin: 0;">${invoice.terms}</p>
        `;
        notesSection.appendChild(terms);
      }
      
      invoiceContent.appendChild(notesSection);
    }
    
    // Create a popup window for printing
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
      alert('Please allow popups for this website to download the invoice');
      return;
    }
    
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(invoiceContent.outerHTML);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    // Add a small delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  const handleSaveInvoice = async (status: 'draft' | 'sent' = 'draft') => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Prepare invoice data
      const invoiceData = {
        ...invoice,
        status,
        created_by: user.id
      };
      
      // Save invoice to database
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (!data?.id) throw new Error('Failed to create invoice');
      
      // Save invoice items
      const itemsWithInvoiceId = invoice.items.map(item => ({
        ...item,
        invoice_id: data.id
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
      
      if (itemsError) throw itemsError;
      
      // Fetch the complete invoice with its generated invoice_number
      const { data: savedInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (onSaved && savedInvoice) {
        onSaved(savedInvoice as Invoice);
      }
      
      alert(`Invoice ${savedInvoice.invoice_number} saved successfully!`);
      
      // Reset form if staying on page
      if (!onClose) {
        resetForm();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setInvoice({
      client_name: '',
      client_email: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      status: 'draft',
      template_type: 'personal_training',
      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      items: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-light">
          Create New Invoice
        </h2>
        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
      </div>

      <Card>
        <CardBody className="space-y-6">
          {/* Template Selection */}
          <InvoiceTemplateSelector 
            selectedTemplate={invoice.template_type} 
            onSelectTemplate={handleTemplateChange} 
          />
          
          {/* Client Information */}
          <InvoiceClientSection
            invoice={invoice}
            setInvoice={setInvoice}
            clients={clients}
            loadingClients={loadingClients}
            onSelectClient={handleSelectClient}
          />
          
          {/* Invoice Items */}
          <InvoiceItemsList
            items={invoice.items}
            setItems={(items) => setInvoice(prev => ({ ...prev, items }))}
          />

          {/* Invoice Totals */}
          <div className="space-y-4 pt-4 border-t border-primary/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-light/70 text-sm mb-1">
                  Notes
                </label>
                <textarea
                  value={invoice.notes || ''}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                  rows={4}
                  placeholder="Add notes to invoice..."
                />
              </div>
              <div>
                <label className="block text-light/70 text-sm mb-1">
                  Terms
                </label>
                <textarea
                  value={invoice.terms || ''}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-3 text-light placeholder-light/30 focus:outline-none focus:border-primary"
                  rows={4}
                  placeholder="Add terms and conditions..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-light/70">Subtotal</span>
                  <span className="text-light">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-light/70">Tax Rate</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoice.tax_rate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, tax_rate: Number(e.target.value) }))}
                      className="w-16 bg-dark border border-primary/20 rounded p-1 text-light text-right"
                    />
                    <span className="text-light/70">%</span>
                  </div>
                  <span className="text-light">${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-light/70">Discount</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-light">$</span>
                    <input
                      type="number"
                      min="0"
                      value={invoice.discount_amount}
                      onChange={(e) => setInvoice(prev => ({ ...prev, discount_amount: Number(e.target.value) }))}
                      className="w-24 bg-dark border border-primary/20 rounded p-1 text-light text-right"
                    />
                  </div>
                </div>
                <div className="flex justify-between py-2 pt-3 border-t border-primary/10 text-lg font-semibold">
                  <span className="text-light">Total</span>
                  <span className="text-primary">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="ghost"
              onClick={resetForm}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1"
            >
              <FileDown className="w-4 h-4" /> Download PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSaveInvoice('draft')}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSaveInvoice('sent')}
              disabled={isSaving}
              className="flex items-center gap-1"
            >
              <Send className="w-4 h-4" /> Save & Send
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default InvoiceCreator;
