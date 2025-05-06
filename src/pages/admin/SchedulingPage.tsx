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
    <div className="max-w-6xl mx-auto p-2 sm:p-6 md:p-10 lg:p-14 xl:p-20">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-8 tracking-tight drop-shadow-lg">
        Scheduling <span className="text-cyan-400">&</span> Bookings
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Booking Stats Widget */}
        <div className="bg-gradient-to-br from-dark/90 via-primary/10 to-cyan-900/20 border border-primary/30 rounded-2xl p-7 flex flex-col items-center shadow-xl glassy">
          <div className="text-primary font-extrabold text-xl mb-4 tracking-wide">Booking Stats</div>
          <div className="flex gap-8 w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-primary text-3xl font-extrabold drop-shadow">{totalBookings}</span>
              <span className="text-xs text-light/70">Total</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-green-400 text-3xl font-extrabold drop-shadow">{todaysBookings}</span>
              <span className="text-xs text-light/70">Today</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-cyan-300 text-3xl font-extrabold drop-shadow">{upcomingBookings.length}</span>
              <span className="text-xs text-light/70">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Recent Bookings Widget */}
        <div className="bg-gradient-to-br from-dark/90 via-primary/10 to-cyan-900/20 border border-primary/30 rounded-2xl p-7 flex flex-col shadow-xl glassy">
          <div className="text-primary font-extrabold text-xl mb-4 tracking-wide">Recent Bookings</div>
          <ul className="text-light/90 text-base space-y-2">
            {recentBookings.map(b => (
              <li key={b.id} className="flex justify-between items-center">
                <span className="font-semibold text-light/90">{b.service_type} - {b.client}</span>
                <span className="text-xs text-light/60">{b.date}</span>
              </li>
            ))}
            {recentBookings.length === 0 && <li className="text-light/50 italic">No recent bookings</li>}
          </ul>
        </div>
        {/* Upcoming Bookings Widget */}
        <div className="bg-gradient-to-br from-dark/90 via-primary/10 to-cyan-900/20 border border-primary/30 rounded-2xl p-7 flex flex-col shadow-xl glassy">
          <div className="text-primary font-extrabold text-xl mb-4 tracking-wide">Upcoming Bookings</div>
          <ul className="text-light/90 text-base space-y-2">
            {upcomingBookings.map(b => (
              <li key={b.id} className="flex justify-between items-center">
                <span className="font-semibold text-light/90">{b.service_type} - {b.client}</span>
                <span className="text-xs text-light/60">{b.date}</span>
              </li>
            ))}
            {upcomingBookings.length === 0 && <li className="text-light/50 italic">No upcoming bookings</li>}
          </ul>
        </div>
      </div>
      {/* --- END WIDGETS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-16">
        <div className="md:col-span-2">
          <BookingCalendar onNewBooking={handleOpenForm} />
        </div>
        <div className="bg-gradient-to-br from-dark/70 via-primary/10 to-cyan-900/20 rounded-2xl border border-primary/10 shadow-xl p-8 flex flex-col items-center min-h-[350px] glassy">
          <h3 className="text-xl font-bold text-primary mb-6 tracking-wide">How to use Scheduling</h3>
          <ul className="text-light/80 text-base space-y-3 list-disc pl-5">
            <li>Click <span className="text-primary font-bold">+ New Booking</span> to create a new appointment.</li>
            <li>Use the calendar to view and manage bookings by date.</li>
            <li>See all bookings and edit/delete in the table below.</li>
          </ul>
        </div>
      </div>
      <div className="mt-14">
        <BookingList onEditBooking={handleEditBooking} />
      </div>
      <BookingForm open={formOpen} onClose={handleCloseForm} initialData={editBooking} />
    </div>
  );
};

export default SchedulingPage;
