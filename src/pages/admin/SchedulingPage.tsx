import React, { useState } from "react";
import BookingCalendar from "../../components/admin/BookingCalendar";
import BookingList from "../../components/admin/BookingList";
import BookingForm from "../../components/admin/BookingForm";

const SchedulingPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any | null>(null);

  // Handler to open the booking form modal for new booking
  const handleOpenForm = () => {
    setEditBooking(null);
    setFormOpen(true);
  };
  // Handler to open the form for editing a booking
  const handleEditBooking = (booking: any) => {
    setEditBooking(booking);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditBooking(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 tracking-tight">Scheduling & Bookings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        <div className="md:col-span-2">
          <BookingCalendar onNewBooking={handleOpenForm} />
        </div>
        <div>{/* Optionally: quick create form or info */}</div>
      </div>
      <div className="mt-6 sm:mt-10">
        <BookingList onEditBooking={handleEditBooking} />
      </div>
      <BookingForm open={formOpen} onClose={handleCloseForm} initialData={editBooking} />
    </div>
  );
};

export default SchedulingPage;
