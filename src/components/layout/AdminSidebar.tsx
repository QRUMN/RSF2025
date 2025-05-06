import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  LogOut,
  X,
  DollarSign,
  Utensils,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface AdminSidebarProps {
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 h-full bg-dark-surface border-r border-primary/10 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img 
            src="https://raw.githubusercontent.com/QRUMN/RSFIMG/main/RSF_IconOnly_FullColor%20(1).png"
            alt="RSF Logo"
            className="w-10 h-10 object-contain mr-3"
          />
          <span className="text-xl font-display font-bold text-light">RSF Admin</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-light/70" />
          </Button>
        )}
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/admin/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/scheduling"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <Calendar className="w-5 h-5 mr-3" />
          Scheduling
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <Users className="w-5 h-5 mr-3" />
          Users
        </NavLink>

        <NavLink
          to="/admin/meal-plans"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <Utensils className="w-5 h-5 mr-3" />
          Meal Plans
        </NavLink>

        <NavLink
          to="/admin/financial"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <DollarSign className="w-5 h-5 mr-3" />
          Financial
        </NavLink>

        <NavLink
          to="/admin/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
        >
          <Settings className="w-5 h-5 mr-3" />
          Admin Settings
        </NavLink>

        <button
          onClick={() => {
            handleLogout();
            onClose?.();
          }}
          className="w-full flex items-center px-4 py-2 rounded-lg text-light/70 hover:bg-primary/10 hover:text-light transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};