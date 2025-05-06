import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { Section } from '../ui/Section';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookingModal } from './BookingModal';

interface ServiceProvider {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  image_url: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: 'training' | 'massage' | 'consultation';
  provider_id: string;
}

interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export const BookingSection: React.FC = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchProviders();
      fetchUpcomingBookings();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    const provider = providers.find(p => p.id === service.provider_id);
    setSelectedProvider(provider || null);
    setIsModalOpen(true);
  };

  return (
    <Section>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold text-light mb-6">
            Book a Session
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card hover className="h-full">
                  <CardBody>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        {service.category === 'training' ? (
                          <User className="w-6 h-6 text-primary" />
                        ) : service.category === 'massage' ? (
                          <Clock className="w-6 h-6 text-primary" />
                        ) : (
                          <Calendar className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-light">{service.name}</h3>
                        <p className="text-sm text-primary">{service.duration}</p>
                      </div>
                    </div>
                    <p className="text-light/70 text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-light font-semibold">${service.price}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => handleServiceSelect(service)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {upcomingBookings.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-light mb-6">
              Upcoming Sessions
            </h3>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => {
                const service = services.find(s => s.id === booking.service_id);
                const provider = providers.find(p => p.id === booking.provider_id);

                return (
                  <Card key={booking.id}>
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-light">
                            {service?.name}
                          </h4>
                          <p className="text-sm text-light/70">
                            with {provider?.name}
                          </p>
                          <p className="text-sm text-primary mt-1">
                            {format(new Date(booking.date), 'MMM d, yyyy')} at{' '}
                            {booking.start_time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Handle rescheduling */}}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Handle cancellation */}}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedService && selectedProvider && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
          provider={selectedProvider}
          onSuccess={fetchUpcomingBookings}
        />
      )}
    </Section>
  );
};