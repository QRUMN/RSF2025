import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../components/scheduling/CalendarStyles.css';
import { supabase } from '../../lib/supabase';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import AddAppointmentModal from '../../components/scheduling/AddAppointmentModal';
import AppointmentDetailsModal from '../../components/scheduling/AppointmentDetailsModal';
import FilterPanel from '../../components/scheduling/FilterPanel';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Define the appointment types
export type AppointmentType = 'personal_training' | 'massage' | 'consultation' | 'vendor';

// Define the appointment interface
export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client_id?: string;
  client_name: string;
  type: AppointmentType;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  staff_id?: string;
  staff_name?: string;
  location?: string;
  color?: string;
  requires_deposit?: boolean;
  deposit_amount?: number;
  deposit_invoice_id?: string;
  deposit_paid?: boolean;
}

const SchedulingPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState({
    types: [] as AppointmentType[],
    status: [] as string[],
    staff: [] as string[]
  });
  const [view, setView] = useState('week');

  // Define colors for different appointment types
  const typeColors = {
    personal_training: '#4f46e5', // Indigo
    massage: '#0891b2', // Cyan
    consultation: '#7c3aed', // Violet
    vendor: '#ea580c', // Orange
  };

  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if the appointments table exists
      const { error: tableCheckError } = await supabase
        .from('appointments')
        .select('count')
        .limit(1);

      if (tableCheckError) {
        console.log('Appointments table may not exist:', tableCheckError);
        // Generate sample data for demonstration
        const sampleAppointments = generateSampleAppointments();
        setAppointments(sampleAppointments);
        setLoading(false);
        return;
      }

      // If table exists, fetch real data
      const { data, error } = await supabase
        .from('appointments')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Transform the data to match our Appointment interface
        const formattedAppointments: Appointment[] = data.map(apt => ({
          id: apt.id,
          title: apt.title,
          start: new Date(apt.start_time),
          end: new Date(apt.end_time),
          client_id: apt.client_id,
          client_name: apt.client_name,
          type: apt.type,
          notes: apt.notes,
          status: apt.status,
          staff_id: apt.staff_id,
          staff_name: apt.staff_name,
          location: apt.location,
          color: typeColors[apt.type as AppointmentType]
        }));

        setAppointments(formattedAppointments);
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
      // Generate sample data as fallback
      const sampleAppointments = generateSampleAppointments();
      setAppointments(sampleAppointments);
    } finally {
      setLoading(false);
    }
  };

  // Generate sample appointments for demonstration
  const generateSampleAppointments = (): Appointment[] => {
    const types: AppointmentType[] = ['personal_training', 'massage', 'consultation', 'vendor'];
    const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
    const sampleAppointments: Appointment[] = [];
    
    // Generate appointments for the current week
    const startOfWeek = moment().startOf('week').toDate();
    
    for (let i = 0; i < 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)] as AppointmentType;
      const status = statuses[Math.floor(Math.random() * statuses.length)] as Appointment['status'];
      const dayOffset = Math.floor(Math.random() * 7); // 0-6 days from start of week
      const hourOffset = 9 + Math.floor(Math.random() * 8); // 9am-5pm
      
      const start = moment(startOfWeek).add(dayOffset, 'days').set('hour', hourOffset).set('minute', 0).toDate();
      const end = moment(start).add(1, 'hours').toDate();
      
      sampleAppointments.push({
        id: `sample-${i}`,
        title: `${type.replace('_', ' ').toUpperCase()} - Client ${i + 1}`,
        start,
        end,
        client_name: `Sample Client ${i + 1}`,
        type,
        status,
        staff_name: `Trainer ${Math.floor(Math.random() * 3) + 1}`,
        location: 'Main Studio',
        notes: 'This is a sample appointment for demonstration purposes.',
        color: typeColors[type]
      });
    }
    
    return sampleAppointments;
  };

  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter(apt => {
    if (filters.types.length > 0 && !filters.types.includes(apt.type)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(apt.status)) {
      return false;
    }
    if (filters.staff.length > 0 && !filters.staff.includes(apt.staff_name || '')) {
      return false;
    }
    return true;
  });

  // Handle appointment click
  const handleAppointmentClick = (event: Appointment) => {
    setSelectedAppointment(event);
    setIsDetailsModalOpen(true);
  };

  // Handle appointment update
  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  // Handle appointment delete
  const handleAppointmentDelete = (id: string) => {
    setAppointments(prevAppointments => 
      prevAppointments.filter(apt => apt.id !== id)
    );
  };

  // Handle appointment add
  const handleAppointmentAdd = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
    setIsAddModalOpen(false);
  };

  // Load appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Custom event styling
  const eventStyleGetter = (event: Appointment) => {
    const isCancelled = event.status === 'cancelled';
    const isCompleted = event.status === 'completed';
    
    return {
      style: {
        backgroundColor: typeColors[event.type] || '#3174ad',
        borderRadius: '4px',
        opacity: isCancelled ? 0.6 : isCompleted ? 0.8 : 1,
        border: isCancelled ? '1px dashed #888' : isCompleted ? '1px solid #fff' : 'none',
        color: '#fff',
        textTransform: 'capitalize' as const
      }
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-light mb-6">Scheduling</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Add Appointment
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchAppointments}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            size="md"
          >
            Refresh
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center bg-gray-800/70 px-3 py-1 rounded-full">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-light/90 capitalize">
                {type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-100 p-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      <FilterPanel 
        filters={filters}
        setFilters={setFilters}
        appointments={appointments}
      />
      
      <div className="bg-gray-800/30 rounded-lg overflow-hidden h-[calc(100vh-16rem)] shadow-lg">
        <Calendar
          localizer={localizer}
          events={filteredAppointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleAppointmentClick}
          onSelectSlot={() => setIsAddModalOpen(true)}
          selectable
          dayPropGetter={(date) => {
            const today = new Date();
            if (date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
              return { className: 'rbc-today' };
            }
            return {};
          }}
        />
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          appointment={selectedAppointment}
          onAppointmentUpdate={handleAppointmentUpdate}
          onAppointmentDelete={handleAppointmentDelete}
          typeColors={typeColors}
        />
      )}
      
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAppointmentAdd={(appointment) => {
          setAppointments([...appointments, appointment]);
        }}
        typeColors={typeColors}
      />
    </div>
  );
};

export default SchedulingPage;
