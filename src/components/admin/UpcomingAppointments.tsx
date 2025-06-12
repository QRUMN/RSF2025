import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../ui/Card';
import { Calendar, Clock, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Appointment, AppointmentType } from '../../pages/admin/SchedulingPage';
import moment from 'moment';

interface UpcomingAppointmentsProps {
  limit?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ limit = 5 }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define colors for different appointment types
  const typeColors: Record<AppointmentType, string> = {
    personal_training: '#4f46e5', // Indigo
    massage: '#0891b2', // Cyan
    consultation: '#059669', // Emerald
    vendor: '#d97706', // Amber
  };

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start', now)
        .not('status', 'eq', 'cancelled')
        .order('start', { ascending: true })
        .limit(limit);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform the data to match our Appointment interface
      const formattedAppointments = data.map(apt => ({
        ...apt,
        start: new Date(apt.start),
        end: new Date(apt.end)
      })) as Appointment[];
      
      setAppointments(formattedAppointments);
    } catch (err: any) {
      console.error('Error fetching upcoming appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUpcomingAppointments();
  }, [limit]);

  const formatAppointmentTime = (start: Date, end: Date) => {
    return `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
  };

  const formatAppointmentDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return moment(date).format('ddd, MMM D');
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-light flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Upcoming Appointments
          </h3>
          <Link 
            to="/admin/scheduling" 
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="h-2 w-2 bg-primary rounded-full"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-400 text-sm">
            Error loading appointments
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-light/50">
            No upcoming appointments
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: typeColors[appointment.type] }}
                      ></div>
                      <h4 className="font-medium text-light">{appointment.title}</h4>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-light/70">
                      <User className="w-3.5 h-3.5 mr-1.5" />
                      {appointment.client_name}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-light/70">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {formatAppointmentTime(appointment.start, appointment.end)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-700 text-light/80">
                      {formatAppointmentDate(appointment.start)}
                    </span>
                    {appointment.status === 'confirmed' && (
                      <span className="block mt-1 text-xs text-green-400">Confirmed</span>
                    )}
                    {appointment.status === 'pending' && (
                      <span className="block mt-1 text-xs text-yellow-400">Pending</span>
                    )}
                    {appointment.status === 'completed' && (
                      <span className="block mt-1 text-xs text-blue-400">Completed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default UpcomingAppointments;
