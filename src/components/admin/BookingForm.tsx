import React, { useState } from "react";
import { useBookings } from "../../hooks/useBookings";
import ClientSearch from "./ClientSearch";

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: any; // could be Partial<Booking>
}

const defaultFields = {
  service_type: "personal_training",
  client: "",
  staff: "",
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  notes: "",
};

const BookingForm: React.FC<BookingFormProps> = ({ open, onClose, initialData }) => {
  const isEdit = Boolean(initialData && initialData.id);
  const [fields, setFields] = useState({
    ...defaultFields,
    ...initialData,
  });
  const { createBooking, updateBooking, loading, error } = useBookings();
  const [formError, setFormError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev: typeof fields) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Basic validation
    const clientId = typeof fields.client === 'object' && fields.client !== null ? fields.client.id : fields.client;
    if (!fields.service_type || !clientId || !fields.staff || !fields.date || !fields.start_time || !fields.end_time || !fields.location) {
      setFormError("Please fill in all required fields.");
      return;
    }
    try {
      const bookingData = { ...fields, client: clientId };
      if (isEdit) {
        await updateBooking(fields.id, bookingData);
      } else {
        await createBooking(bookingData);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Error saving booking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-dark rounded-lg p-4 sm:p-8 shadow-xl border border-primary/20 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center sticky top-0 bg-dark z-10 pb-4 mb-4 border-b border-primary/10">
          <h2 className="text-xl font-bold text-primary">{isEdit ? "Edit Booking" : "New Booking"}</h2>
          <button type="button" onClick={onClose} className="text-light hover:text-primary text-2xl leading-none">&times;</button>
        </div>
        {loading && <div className="text-light/60 mb-2">Saving booking...</div>}
        {(error || formError) && <div className="text-red-400 mb-2">{formError || error}</div>}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          {/* Left column: Service Type, Client, Staff */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-light mb-1">Service Type <span className="text-red-500">*</span></label>
              <select
                name="serviceType"
                value={fields.serviceType}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              >
                <option value="personal_training">Personal Training</option>
                <option value="massage">Massage/Body Work</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-light mb-1">Client <span className="text-red-500">*</span></label>
              <ClientSearch
                onSelect={(client: { id: string; name: string } | null) => setFields((prev: typeof fields) => ({ ...prev, client }))}
                selectedClient={typeof fields.client === 'object' && fields.client !== null ? fields.client : undefined}
              />
              {fields.client && (
                <div className="text-xs text-primary mt-1">Selected: {fields.client.name}</div>
              )}
            </div>
            <div>
              <label className="block text-light mb-1">Staff Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="staff"
                value={fields.staff}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
                required
              />
            </div>
          </div>
          {/* Right column: Date, Start Time, End Time */}
          <div className="flex flex-col gap-5">
            <div className="flex-1 sm:w-48 w-full">
              <label className="block text-light mb-1">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={fields.date}
                  onChange={handleChange}
                  className="w-full rounded bg-dark border border-primary/20 text-light p-2 pr-10 appearance-none"
                  required
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {/* Custom visible calendar icon */}
                  <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-light mb-1">Start Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="start_time"
                  value={fields.start_time}
                  onChange={handleChange}
                  className="w-full rounded bg-dark border border-primary/20 text-light p-2 pr-10 appearance-none"
                  required
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 24 }, (_, h) =>
                    Array.from({ length: 4 }, (_, m) => {
                      const hour = h.toString().padStart(2, '0');
                      const min = (m * 15).toString().padStart(2, '0');
                      const h12 = ((h % 12) || 12).toString().padStart(2, '0');
                      const ampm = h < 12 ? 'AM' : 'PM';
                      return (
                        <option key={hour + ':' + min} value={`${hour}:${min}`}>{`${h12}:${min} ${ampm}`}</option>
                      );
                    })
                  )}
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {/* Clock icon - visible on dark bg */}
                  <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
                    <path d="M12 6v6l4 2" stroke="currentColor" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-light mb-1">End Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="end_time"
                  value={fields.end_time}
                  onChange={handleChange}
                  className="w-full rounded bg-dark border border-primary/20 text-light p-2 pr-10 appearance-none"
                  required
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 24 }, (_, h) =>
                    Array.from({ length: 4 }, (_, m) => {
                      const hour = h.toString().padStart(2, '0');
                      const min = (m * 15).toString().padStart(2, '0');
                      const h12 = ((h % 12) || 12).toString().padStart(2, '0');
                      const ampm = h < 12 ? 'AM' : 'PM';
                      return (
                        <option key={hour + ':' + min} value={`${hour}:${min}`}>{`${h12}:${min} ${ampm}`}</option>
                      );
                    })
                  )}
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {/* Clock icon - visible on dark bg */}
                  <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
                    <path d="M12 6v6l4 2" stroke="currentColor" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {/* Full width: Location and Notes */}
          <div className="md:col-span-2 flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-light mb-1">Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="location"
                value={fields.location}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
                required
              />
            </div>
            <div>
              <label className="block text-light mb-1">Notes</label>
              <textarea
                name="notes"
                value={fields.notes}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2 min-h-[48px]"
              />
            </div>
          </div>
          {/* Actions */}
          <div className="md:col-span-2 flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{isEdit ? "Save Changes" : "Create Booking"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
