import React, { useState } from "react";
import { useBookings } from "../../hooks/useBookings";

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
    if (!fields.client || !fields.staff || !fields.date || !fields.start_time || !fields.end_time) {
      setFormError("Please fill in all required fields.");
      return;
    }
    try {
      if (isEdit) {
        await updateBooking(fields.id, fields);
      } else {
        await createBooking(fields);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Error saving booking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-dark rounded-lg p-4 sm:p-8 shadow-lg border border-primary/20 min-w-[90vw] sm:min-w-[340px] max-w-md w-full">
        <div className="text-base sm:text-lg font-bold text-primary mb-4">{initialData ? "Edit Booking" : "New Booking"}</div>
        {loading && <div className="text-light/60 mb-2">Saving booking...</div>}
        {(error || formError) && <div className="text-red-400 mb-2">{formError || error}</div>}
        <form onSubmit={handleSave} className="flex flex-col gap-3 sm:gap-4">

          <div>
            <label className="block text-light mb-1">Service Type</label>
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
            <label className="block text-light mb-1">Client Name</label>
            <input
              type="text"
              name="client"
              value={fields.client}
              onChange={handleChange}
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              required
            />
          </div>
          <div>
            <label className="block text-light mb-1">Staff Name</label>
            <input
              type="text"
              name="staff"
              value={fields.staff}
              onChange={handleChange}
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-light mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={fields.date}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-light mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={fields.startTime}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-light mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={fields.endTime}
                onChange={handleChange}
                className="w-full rounded bg-dark border border-primary/20 text-light p-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-light mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={fields.location}
              onChange={handleChange}
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
            />
          </div>
          <div>
            <label className="block text-light mb-1">Notes</label>
            <textarea
              name="notes"
              value={fields.notes}
              onChange={handleChange}
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
