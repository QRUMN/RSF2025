import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  LogOut,
  X,
  DollarSign,
  Calendar,
  MessageCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface AdminSidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose, isCollapsed = false, onToggleCollapse }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button - Positioned relative to sidebar */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={`absolute ${isCollapsed ? 'left-16' : 'left-[17rem]'} top-[4.5rem] z-40 flex items-center justify-center bg-dark-surface rounded-full w-8 h-8 border border-primary/20 shadow-md hover:bg-primary/10 transition-all duration-300`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-primary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-primary" />
          )}
        </button>
      )}
      
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-dark-surface border-r border-primary/10 p-6 overflow-y-auto transition-all duration-300`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img 
            src="https://raw.githubusercontent.com/QRUMN/RSFIMG/main/RSF_IconOnly_FullColor%20(1).png"
            alt="RSF Logo"
            className="w-10 h-10 object-contain mr-3"
          />
          {!isCollapsed && <span className="text-xl font-display font-bold text-light">RSF Admin</span>}
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
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Dashboard"
        >
          <LayoutDashboard className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Dashboard'}
        </NavLink>

        <NavLink
          to="/admin/users"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Users"
        >
          <Users className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Users'}
        </NavLink>

        <NavLink
          to="/admin/financials"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Financials"
        >
          <DollarSign className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Financials'}
        </NavLink>

        <NavLink
          to="/admin/messaging"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Messages"
        >
          <MessageCircle className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Messages'}
        </NavLink>

        <NavLink
          to="/admin/products"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Products"
        >
          <ShoppingBag className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Products'}
        </NavLink>

        <NavLink
          to="/admin/scheduling"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Scheduling"
        >
          <Calendar className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Scheduling'}
        </NavLink>

        <NavLink
          to="/admin/meal-planning"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Meal Planning"
        >
          <Utensils className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Meal Planning'}
        </NavLink>

        <NavLink
          to="/admin/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-dark'
                : 'text-light/70 hover:bg-primary/10 hover:text-light'
            }`
          }
          title="Settings"
        >
          <Settings className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Settings'}
        </NavLink>

        <button
          onClick={() => {
            handleLogout();
            onClose?.();
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg text-light/70 hover:bg-primary/10 hover:text-light transition-colors`}
          title="Logout"
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Logout'}
        </button>
      </nav>
      </div>
    </div>
  );
};