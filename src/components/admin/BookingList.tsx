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

  return (
    <div className="rounded-lg border border-primary/20 bg-dark/90 shadow p-2 sm:p-4 overflow-x-auto">
      <h2 className="text-xl font-bold text-primary mb-4">All Bookings</h2>
      {loading && <div className="text-light/60 mb-2">Loading bookings...</div>}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary/10 text-xs sm:text-sm">
          <thead className="bg-dark/90">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-primary tracking-wider uppercase whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {bookings.map((booking) => (
              <tr key={booking.id} className="transition hover:bg-primary/10">
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light font-medium">{booking.service_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">{booking.client}</td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">{booking.staff}</td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">{booking.date}</td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">
                  {booking.start_time} - {booking.end_time}
                </td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">{booking.location}</td>
                <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-light">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.status === "completed"
                        ? "bg-green-700/30 text-green-300"
                        : booking.status === "cancelled"
                        ? "bg-red-700/30 text-red-300"
                        : "bg-cyan-700/30 text-cyan-200"
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
