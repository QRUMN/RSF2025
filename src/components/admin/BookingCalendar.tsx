import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface BookingCalendarProps {
  onNewBooking?: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onNewBooking }) => {
  // Only allow single date selection
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-dark/90 via-primary/10 to-cyan-900/20 shadow-2xl glassy p-2 sm:p-6 md:p-8 min-h-[370px] flex flex-col items-center justify-center w-full max-w-full">
      <div className="w-full flex flex-col items-center mb-4">
        <button
          className="mx-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white font-bold shadow-lg hover:from-cyan-500 hover:to-primary transition text-lg border-2 border-primary/80 focus:ring-2 focus:ring-cyan-400 focus:outline-none mb-4"
          onClick={onNewBooking}
        >
          + New Booking
        </button>

      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="min-w-[320px] w-full max-w-md mx-auto">
          <Calendar
            onChange={(d) => setDate(d as Date)}
            value={date}
            className="bg-dark rounded-xl text-light shadow-lg border border-primary/20 p-2 mx-auto"
          />
        </div>
      </div>
      <div className="mt-6 text-cyan-200 text-base font-semibold text-center w-full">
        Selected date: <span className="font-bold text-primary">{date ? date.toLocaleDateString() : 'None selected'}</span>
      </div>
    </div>
  );
};

export default BookingCalendar;
