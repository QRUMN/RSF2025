import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface BookingCalendarProps {
  onNewBooking?: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onNewBooking }) => {
  const [date, setDate] = useState<Date | Date[]>(new Date());

  return (
    <div className="rounded-lg border border-primary/20 bg-dark/90 shadow p-2 sm:p-4 min-h-[350px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-bold text-primary">Calendar</h2>
        <button
          className="w-full sm:w-auto px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition"
          onClick={onNewBooking}
        >
          + New Booking
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          <Calendar
            onChange={setDate}
            value={date}
            className="bg-dark rounded-lg text-light"
            calendarType="US"
          />
        </div>
      </div>
      <div className="mt-4 text-light/80 text-sm">
        Selected date: {Array.isArray(date) ? date[0].toLocaleDateString() : date.toLocaleDateString()}
      </div>
    </div>
  );
};

export default BookingCalendar;
