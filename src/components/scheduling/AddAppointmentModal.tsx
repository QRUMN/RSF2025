import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Loader, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Appointment, AppointmentType } from '../../pages/admin/SchedulingPage';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceItem } from '../../types/invoice';
import { format, addDays } from 'date-fns';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentAdd: (appointment: Appointment) => void;
  typeColors: Record<AppointmentType, string>;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentAdd,
  typeColors
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [type, setType] = useState<AppointmentType>('personal_training');
  const [staffName, setStaffName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50');
  const [sendDepositInvoice, setSendDepositInvoice] = useState(false);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      
      // Set end date to 1 hour after start date by default
      const startDateTime = startDate instanceof Date ? startDate.getTime() : new Date().getTime();
      const endDateTime = endDate instanceof Date ? endDate.getTime() : new Date().getTime();
      
      if (startDateTime >= endDateTime) {
        const newEndDate = new Date(date);
        newEndDate.setHours(date.getHours() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setClientName('');
    setClientEmail('');
    setType('personal_training');
    setStaffName('');
    setLocation('');
    setNotes('');
    setStartDate(new Date());
    setEndDate(new Date(new Date().setHours(new Date().getHours() + 1)));
    setRequireDeposit(false);
    setDepositAmount('50');
    setSendDepositInvoice(false);
    setError(null);
    setSuccess(false);
  };

  const createDepositInvoice = async (appointmentId: string): Promise<string | null> => {
    try {
      // Generate invoice number
      const invoiceNumber = `DEP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create invoice item for deposit
      const invoiceItem: InvoiceItem = {
        description: `Deposit for ${title} on ${format(startDate, 'MMM d, yyyy')}`,
        quantity: 1,
        unit_price: parseFloat(depositAmount),
        amount: parseFloat(depositAmount)
      };
      
      // Create the invoice
      const invoice: Partial<Invoice> = {
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail,
        invoice_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        status: 'sent',
        template_type: 'personal_training',
        subtotal: parseFloat(depositAmount),
        tax_rate: 0,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: parseFloat(depositAmount),
        notes: `This is a deposit invoice for your appointment: ${title}. The full amount will be due at the time of service.`,
        terms: 'Deposit is non-refundable if cancelled within 24 hours of appointment.',
        items: [invoiceItem],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert invoice into database
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoice])
        .select();
      
      if (error) throw error;
      
      // Update appointment with invoice reference
      await supabase
        .from('appointments')
        .update({ deposit_invoice_id: data[0].id })
        .eq('id', appointmentId);
      
      return data[0].id;
    } catch (err) {
      console.error('Error creating deposit invoice:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title || !clientName) {
        throw new Error('Title and client name are required');
      }
      
      if (requireDeposit && sendDepositInvoice && !clientEmail) {
        throw new Error('Client email is required to send a deposit invoice');
      }

      const newAppointment: Appointment = {
        id: uuidv4(),
        title,
        start: startDate,
        end: endDate,
        client_name: clientName,
        type,
        status: 'confirmed',
        staff_name: staffName || undefined,
        location: location || undefined,
        notes: notes || undefined,
        color: typeColors[type],
        requires_deposit: requireDeposit,
        deposit_amount: requireDeposit ? parseFloat(depositAmount) : undefined
      };

      // Try to insert into Supabase if available
      try {
        const { error: supabaseError } = await supabase
          .from('appointments')
          .insert([{
            id: newAppointment.id,
            title: newAppointment.title,
            start_time: newAppointment.start.toISOString(),
            end_time: newAppointment.end.toISOString(),
            client_name: newAppointment.client_name,
            type: newAppointment.type,
            status: newAppointment.status,
            staff_name: newAppointment.staff_name,
            location: newAppointment.location,
            notes: newAppointment.notes,
            requires_deposit: requireDeposit,
            deposit_amount: requireDeposit ? parseFloat(depositAmount) : null
          }])
          .select();

        if (supabaseError) throw supabaseError;
        
        // Create and send deposit invoice if requested
        if (requireDeposit && sendDepositInvoice) {
          const invoiceId = await createDepositInvoice(newAppointment.id);
          if (invoiceId) {
            console.log(`Deposit invoice created with ID: ${invoiceId}`);
            // In a real app, we would send an email here
          }
        }
      } catch (err) {
        console.warn('Supabase insert failed, using local state only:', err);
      }

      // Add to local state
      onAppointmentAdd(newAppointment);
      setSuccess(true);
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Add New Appointment"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-2 rounded-md">
            Appointment added successfully!
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-light/70 mb-1">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Appointment Title"
              required
            />
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Client Name*</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Client Name"
              required
            />
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Client Email{requireDeposit && sendDepositInvoice && <span className="text-red-400">*</span>}</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="client@example.com"
              required={requireDeposit && sendDepositInvoice}
            />
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Appointment Type*</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AppointmentType)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="personal_training">Personal Training</option>
              <option value="massage">Massage/Body Work</option>
              <option value="consultation">Consultation</option>
              <option value="vendor">Vendor Booking</option>
            </select>
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Staff Member</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Staff Name"
            />
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Start Date & Time*</label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <CalendarIcon className="absolute right-3 top-3 text-light/50 w-5 h-5" />
            </div>
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">End Date & Time*</label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => date && setEndDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minDate={startDate}
                minTime={startDate instanceof Date ? 
                  new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours(), startDate.getMinutes()) : 
                  undefined
                }
                maxTime={startDate instanceof Date ? 
                  new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59) : 
                  undefined
                }
              />
              <Clock className="absolute right-3 top-3 text-light/50 w-5 h-5" />
            </div>
          </div>
          
          <div>
            <label className="block text-light/70 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Location"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-light/70 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
            placeholder="Additional notes..."
          />
        </div>
        
        {/* Deposit Section */}
        <div className="border-t border-gray-600 pt-4 mt-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="require-deposit"
              checked={requireDeposit}
              onChange={(e) => setRequireDeposit(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary/50"
            />
            <label htmlFor="require-deposit" className="ml-2 text-light">
              Require deposit for this appointment
            </label>
          </div>
          
          {requireDeposit && (
            <div className="space-y-4">
              <div>
                <label className="block text-light/70 mb-1">Deposit Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-0 top-0 flex items-center h-full pl-3 text-light/70">
                    $
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="send-invoice"
                  checked={sendDepositInvoice}
                  onChange={(e) => setSendDepositInvoice(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary/50"
                />
                <label htmlFor="send-invoice" className="ml-2 text-light">
                  Send deposit invoice to client
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !title || !clientName}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
            {requireDeposit && sendDepositInvoice ? 'Add & Send Invoice' : 'Add Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAppointmentModal;
