import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Calendar, 
  BarChart, 
  UserCircle, 
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Close sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      name: 'Messages',
      path: '/messages',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      name: 'Schedule',
      path: '/schedule',
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      name: 'Progress',
      path: '/log-workout',
    },
    {
      icon: <UserCircle className="w-5 h-5" />,
      name: 'Profile',
      path: '/profile',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      name: 'Settings',
      path: '/settings',
    },
  ];

  if (!user) {
    // Redirect to home if not logged in
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Toggle Button (mobile) */}
        <button
          className="md:hidden fixed left-4 top-20 z-50 bg-primary text-dark p-2 rounded-full shadow-lg"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        {/* Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-dark/80 md:hidden z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <nav 
          className={`
            fixed md:sticky top-0 left-0 h-full w-64 bg-dark-surface z-50 transition-transform 
            transform-gpu duration-300 shadow-xl md:shadow-none
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 md:pt-16 flex-shrink-0
          `}
        >
          <div className="h-full flex flex-col p-4 pt-16 md:pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-light/90">
                Navigation
              </h2>
            </div>
            
            <ul className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                      ${location.pathname === item.path
                        ? 'bg-primary text-dark font-medium'
                        : 'text-light/70 hover:bg-primary/10 hover:text-light'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {location.pathname === item.path && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-auto pt-6 border-t border-primary/10">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-light">
                    {user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-light/50">Member</div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-6 pt-24 md:pt-20 pb-12">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
