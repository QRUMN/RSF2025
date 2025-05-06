import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Service, Provider, TimeSlot } from '../../types/booking';
import { Button } from '../ui/Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  provider: Provider;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  service,
  provider
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
  const [step, setStep] = useState(1);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
    if (date) setStep(2);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) return;

    try {
      // TODO: Implement booking creation
      console.log('Booking created:', {
        serviceId: service.id,
        providerId: provider.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot
      });
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-dark-surface rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-light/50 hover:text-light transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-light mb-2">
                Book {service.name}
              </h2>
              <p className="text-light/70">
                with {provider.name} - {provider.title}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-light">
                    Select Date
                  </h3>
                </div>
                <div className="bg-dark rounded-xl p-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={{ before: new Date() }}
                    className="text-light"
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <div className="flex items-center mb-4">
                    <Clock className="w-5 h-5 text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-light">
                      Select Time
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {provider.availability[format(selectedDate, 'yyyy-MM-dd')]?.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleTimeSelect(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedTimeSlot?.id === slot.id
                            ? 'bg-primary text-dark'
                            : slot.available
                            ? 'bg-dark text-light hover:bg-primary/20'
                            : 'bg-dark/50 text-light/30 cursor-not-allowed'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-light">
                <p className="font-semibold">${service.price}</p>
                <p className="text-sm text-light/70">{service.duration} minutes</p>
              </div>
              <Button
                variant="primary"
                disabled={!selectedDate || !selectedTimeSlot}
                onClick={handleBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};