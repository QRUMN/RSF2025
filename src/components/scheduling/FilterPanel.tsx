import React, { useMemo } from 'react';
import { Appointment, AppointmentType } from '../../pages/admin/SchedulingPage';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    types: AppointmentType[];
    status: string[];
    staff: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    types: AppointmentType[];
    status: string[];
    staff: string[];
  }>>;
  appointments: Appointment[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, appointments }) => {
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const types = Array.from(new Set(appointments.map(apt => apt.type)));
    const statuses = Array.from(new Set(appointments.map(apt => apt.status)));
    const staff = Array.from(new Set(appointments.map(apt => apt.staff_name).filter(Boolean) as string[]));
    
    return { types, statuses, staff };
  }, [appointments]);

  const handleTypeToggle = (type: AppointmentType) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      } else {
        return { ...prev, types: [...prev.types, type] };
      }
    });
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => {
      if (prev.status.includes(status)) {
        return { ...prev, status: prev.status.filter(s => s !== status) };
      } else {
        return { ...prev, status: [...prev.status, status] };
      }
    });
  };

  const handleStaffToggle = (staff: string) => {
    setFilters(prev => {
      if (prev.staff.includes(staff)) {
        return { ...prev, staff: prev.staff.filter(s => s !== staff) };
      } else {
        return { ...prev, staff: [...prev.staff, staff] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({ types: [], status: [], staff: [] });
  };

  const hasActiveFilters = filters.types.length > 0 || filters.status.length > 0 || filters.staff.length > 0;

  // Format display names
  const formatDisplayName = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-light font-medium">Filter Appointments</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Appointment Types */}
        <div>
          <h4 className="text-light/70 text-sm mb-2">Appointment Type</h4>
          <div className="space-y-1">
            {filterOptions.types.map(type => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="rounded border-gray-600 text-primary focus:ring-primary/50 bg-gray-700 mr-2"
                />
                <span className="text-light/80 text-sm capitalize">
                  {formatDisplayName(type)}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Status */}
        <div>
          <h4 className="text-light/70 text-sm mb-2">Status</h4>
          <div className="space-y-1">
            {filterOptions.statuses.map(status => (
              <label key={status} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="rounded border-gray-600 text-primary focus:ring-primary/50 bg-gray-700 mr-2"
                />
                <span className="text-light/80 text-sm capitalize">
                  {formatDisplayName(status)}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Staff */}
        <div>
          <h4 className="text-light/70 text-sm mb-2">Staff Member</h4>
          {filterOptions.staff.length > 0 ? (
            <div className="space-y-1">
              {filterOptions.staff.map(staff => (
                <label key={staff} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.staff.includes(staff)}
                    onChange={() => handleStaffToggle(staff)}
                    className="rounded border-gray-600 text-primary focus:ring-primary/50 bg-gray-700 mr-2"
                  />
                  <span className="text-light/80 text-sm">
                    {staff}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-light/50 text-sm italic">No staff members assigned</p>
          )}
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.types.map(type => (
              <div key={`type-${type}`} className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs flex items-center">
                {formatDisplayName(type)}
                <button 
                  onClick={() => handleTypeToggle(type)} 
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {filters.status.map(status => (
              <div key={`status-${status}`} className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded-full text-xs flex items-center">
                {formatDisplayName(status)}
                <button 
                  onClick={() => handleStatusToggle(status)} 
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {filters.staff.map(staff => (
              <div key={`staff-${staff}`} className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded-full text-xs flex items-center">
                {staff}
                <button 
                  onClick={() => handleStaffToggle(staff)} 
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
