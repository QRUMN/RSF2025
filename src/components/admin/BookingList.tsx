import React from "react";
import { useBookings } from "../../hooks/useBookings";

const columns = [
  { label: "Service Type", key: "service_type" },
  { label: "Client", key: "client" },
  { label: "Staff", key: "staff" },
  { label: "Date", key: "date" },
  { label: "Time", key: "time" },
  { label: "Location", key: "location" },
  { label: "Status", key: "status" },
  { label: "Actions", key: "actions" },
];

interface BookingListProps {
  onEditBooking?: (booking: any) => void;
}

const BookingList: React.FC<BookingListProps> = ({ onEditBooking }) => {
  const { bookings, loading, error, deleteBooking } = useBookings();
  const [filterClient, setFilterClient] = React.useState("");
  const [filterStaff, setFilterStaff] = React.useState("");
  const [filterService, setFilterService] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterStartDate, setFilterStartDate] = React.useState("");
  const [filterEndDate, setFilterEndDate] = React.useState("");

  // Filter bookings based on filter state
  const filteredBookings = bookings.filter((b) => {
    const matchClient = filterClient ? b.client?.toLowerCase().includes(filterClient.toLowerCase()) : true;
    const matchStaff = filterStaff ? b.staff?.toLowerCase().includes(filterStaff.toLowerCase()) : true;
    const matchService = filterService ? b.service_type === filterService : true;
    const matchStatus = filterStatus ? b.status === filterStatus : true;
    const matchStartDate = filterStartDate ? b.date >= filterStartDate : true;
    const matchEndDate = filterEndDate ? b.date <= filterEndDate : true;
    return matchClient && matchStaff && matchService && matchStatus && matchStartDate && matchEndDate;
  });

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-dark/90 via-primary/10 to-cyan-900/20 shadow-2xl glassy p-2 sm:p-4 md:p-8 overflow-x-auto w-full max-w-full">
      <h2 className="text-2xl font-extrabold text-primary mb-8 drop-shadow tracking-wide">All Bookings</h2>
      {/* Filter/Search Bar */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <input type="text" placeholder="Search client..." className="rounded bg-dark border border-primary/20 text-light p-2 w-36 sm:w-48" onChange={e => setFilterClient(e.target.value)} />
        <input type="text" placeholder="Staff..." className="rounded bg-dark border border-primary/20 text-light p-2 w-28 sm:w-36" onChange={e => setFilterStaff(e.target.value)} />
        <select className="rounded bg-dark border border-primary/20 text-light p-2 w-32" onChange={e => setFilterService(e.target.value)} defaultValue="">
          <option value="">All Services</option>
          <option value="personal_training">Personal Training</option>
          <option value="massage">Massage/Body Work</option>
          <option value="consultation">Consultation</option>
        </select>
        <select className="rounded bg-dark border border-primary/20 text-light p-2 w-28" onChange={e => setFilterStatus(e.target.value)} defaultValue="">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" className="rounded bg-dark border border-primary/20 text-light p-2 w-32" onChange={e => setFilterStartDate(e.target.value)} />
        <input type="date" className="rounded bg-dark border border-primary/20 text-light p-2 w-32" onChange={e => setFilterEndDate(e.target.value)} />
      </div>
      {loading && <div className="text-cyan-300/80 mb-4 animate-pulse">Loading bookings...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary/10 text-sm sm:text-base rounded-xl overflow-hidden shadow-xl">
          <thead className="bg-dark/90">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 sm:px-6 py-3 text-left font-extrabold text-primary tracking-wider uppercase whitespace-nowrap text-base bg-dark/80"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="transition hover:bg-primary/10 hover:shadow-lg cursor-pointer rounded-xl">
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light font-semibold">
                  <span className="inline-block rounded bg-primary/20 px-2 py-1 text-primary font-bold text-xs uppercase tracking-wide">
                    {booking.service_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light font-medium">{booking.client}</td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light">{booking.staff}</td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-cyan-200 font-bold">{booking.date}</td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light">
                  <span className="bg-cyan-700/10 text-cyan-200 rounded px-2 py-1 font-mono text-xs">
                    {booking.start_time} - {booking.end_time}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light">{booking.location}</td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-light">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-extrabold tracking-wide shadow ${
                      booking.status === "completed"
                        ? "bg-green-700/30 text-green-300 border border-green-500/30"
                        : booking.status === "cancelled"
                        ? "bg-red-700/30 text-red-300 border border-red-500/30"
                        : "bg-cyan-700/30 text-cyan-200 border border-cyan-500/30"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light flex flex-col sm:flex-row gap-2">
                  <button
                    className="w-full sm:w-auto px-2 py-1 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition text-xs"
                    onClick={() => onEditBooking && onEditBooking(booking)}
                    disabled={!onEditBooking}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full sm:w-auto px-2 py-1 rounded bg-red-700/20 text-red-400 font-semibold hover:bg-red-700/40 transition text-xs"
                    onClick={() => deleteBooking(booking.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;
