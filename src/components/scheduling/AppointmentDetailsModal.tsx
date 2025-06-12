import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Loader, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Appointment, AppointmentType } from '../../pages/admin/SchedulingPage';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentDelete: (id: string) => void;
  typeColors: Record<AppointmentType, string>;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentUpdate,
  onAppointmentDelete,
  typeColors
}) => {
  const [startDate, setStartDate] = useState<Date>(appointment.start);
  const [endDate, setEndDate] = useState<Date>(appointment.end);
  const [title, setTitle] = useState(appointment.title);
  const [clientName, setClientName] = useState(appointment.client_name);
  const [type, setType] = useState<AppointmentType>(appointment.type);
  const [staffName, setStaffName] = useState(appointment.staff_name || '');
  const [location, setLocation] = useState(appointment.location || '');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [status, setStatus] = useState(appointment.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      
      // Ensure end date is after start date
      const startDateTime = date.getTime();
      const endDateTime = endDate instanceof Date ? endDate.getTime() : new Date().getTime();
      
      if (startDateTime >= endDateTime) {
        const newEndDate = new Date(date);
        newEndDate.setHours(date.getHours() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      // Ensure end date is after start date
      const startDateTime = startDate instanceof Date ? startDate.getTime() : new Date().getTime();
      const endDateTime = date.getTime();
      
      if (endDateTime > startDateTime) {
        setEndDate(date);
      } else {
        setError('End time must be after start time');
        setTimeout(() => setError(null), 3000);
      }
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

      const updatedAppointment: Appointment = {
        ...appointment,
        title,
        start: startDate,
        end: endDate,
        client_name: clientName,
        type,
        status,
        staff_name: staffName || undefined,
        location: location || undefined,
        notes: notes || undefined,
        color: typeColors[type]
      };

      // Try to update in Supabase if available
      try {
        const { error: supabaseError } = await supabase
          .from('appointments')
          .update({
            title: updatedAppointment.title,
            start_time: updatedAppointment.start.toISOString(),
            end_time: updatedAppointment.end.toISOString(),
            client_name: updatedAppointment.client_name,
            type: updatedAppointment.type,
            status: updatedAppointment.status,
            staff_name: updatedAppointment.staff_name,
            location: updatedAppointment.location,
            notes: updatedAppointment.notes
          })
          .eq('id', updatedAppointment.id);

        if (supabaseError) {
          console.warn('Could not update in Supabase, using local state only:', supabaseError);
        }
      } catch (err) {
        console.warn('Supabase update failed, using local state only:', err);
      }

      // Update in local state
      onAppointmentUpdate(updatedAppointment);
      setSuccess(true);
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to delete from Supabase if available
      try {
        const { error: supabaseError } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);

        if (supabaseError) {
          console.warn('Could not delete from Supabase, using local state only:', supabaseError);
        }
      } catch (err) {
        console.warn('Supabase delete failed, using local state only:', err);
      }

      // Delete from local state
      onAppointmentDelete(appointment.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSendReminder = () => {
    alert('Reminder functionality will be implemented in a future update.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      size="lg"
    >
      {isDeleteConfirmOpen ? (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          </div>
          <p className="mb-6 text-light/70">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Appointment
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-2 rounded-md">
              Appointment updated successfully!
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Editable fields */}
            <div className="space-y-4">
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
                    onChange={handleEndDateChange}
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
                <label className="block text-light/70 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            {/* Right column - Additional fields and info */}
            <div className="space-y-4">
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
                <label className="block text-light/70 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
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
                <label className="block text-light/70 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md text-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Location"
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mb-3"
                  onClick={handleSendReminder}
                >
                  Send Reminder to Client
                </Button>
                
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  Delete Appointment
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={loading || !title || !clientName}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AppointmentDetailsModal;
