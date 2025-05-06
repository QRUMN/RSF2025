import React, { useState } from "react";
import BookingCalendar from "../../components/admin/BookingCalendar";
import BookingList from "../../components/admin/BookingList";
import BookingForm from "../../components/admin/BookingForm";
import { useBookings } from "../../hooks/useBookings";
import { Calendar, PlusCircle } from "lucide-react";

const SchedulingPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any | null>(null);
  const { bookings, loading } = useBookings();

  // --- Widget helpers ---
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingBookings = bookings.filter(b => b.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const recentBookings = bookings.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const totalBookings = bookings.length;
  const todaysBookings = bookings.filter(b => b.date === todayStr).length;

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

  // --- WIDGETS ROW ---
  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 tracking-tight">Scheduling & Bookings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Booking Stats Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col items-center shadow">
          <div className="text-primary font-bold text-lg mb-2">Booking Stats</div>
          <div className="flex gap-4 w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-primary text-2xl font-bold">{totalBookings}</span>
              <span className="text-xs text-light/60">Total</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-green-400 text-2xl font-bold">{todaysBookings}</span>
              <span className="text-xs text-light/60">Today</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-cyan-300 text-2xl font-bold">{upcomingBookings.length}</span>
              <span className="text-xs text-light/60">Upcoming</span>
            </div>
          </div>
        </div>
        {/* Quick Actions Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col items-center shadow">
          <div className="text-primary font-bold text-lg mb-2">Quick Actions</div>
          <button
            className="w-full bg-primary text-dark font-semibold rounded-lg py-2 mb-2 hover:bg-primary/90 transition flex items-center justify-center gap-2"
            onClick={handleOpenForm}
          >
            <PlusCircle className="w-5 h-5" /> New Booking
          </button>
          <button
            className="w-full border border-primary text-primary font-semibold rounded-lg py-2 hover:bg-primary/10 transition flex items-center justify-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Calendar className="w-5 h-5" /> View Calendar
          </button>
        </div>
        {/* Recent Bookings Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col shadow">
          <div className="text-primary font-bold text-lg mb-2">Recent Bookings</div>
          <ul className="text-light/90 text-sm space-y-1">
            {recentBookings.map(b => (
              <li key={b.id} className="flex justify-between items-center">
                <span>{b.service_type} - {b.client}</span>
                <span className="text-xs text-light/50">{b.date}</span>
              </li>
            ))}
            {recentBookings.length === 0 && <li className="text-light/50 italic">No recent bookings</li>}
          </ul>
        </div>
        {/* Upcoming Bookings Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col shadow">
          <div className="text-primary font-bold text-lg mb-2">Upcoming Bookings</div>
          <ul className="text-light/90 text-sm space-y-1">
            {upcomingBookings.map(b => (
              <li key={b.id} className="flex justify-between items-center">
                <span>{b.service_type} - {b.client}</span>
                <span className="text-xs text-light/50">{b.date}</span>
              </li>
            ))}
            {upcomingBookings.length === 0 && <li className="text-light/50 italic">No upcoming bookings</li>}
          </ul>
        </div>
      </div>
      {/* --- END WIDGETS ROW --- */}
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
