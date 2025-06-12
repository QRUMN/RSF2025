import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';
import { Button } from '../ui/Button';

const AdminLayout: React.FC = () => {
  // For mobile, sidebar is closed by default
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // For desktop, sidebar is open by default
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin';
  
  // Save sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarOpen');
    if (savedState !== null) {
      setIsDesktopSidebarOpen(savedState === 'true');
    }
  }, []);
  
  const toggleDesktopSidebar = () => {
    const newState = !isDesktopSidebarOpen;
    setIsDesktopSidebarOpen(newState);
    localStorage.setItem('adminSidebarOpen', String(newState));
  };

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu className="w-6 h-6 text-light" />
      </Button>

      {/* Desktop Toggle Sidebar Button - Now positioned by the sidebar itself */}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-dark/80 transition-opacity duration-300 ${
          isMobileSidebarOpen ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-full z-50 shadow-xl transition-all duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDesktopSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'
        }`}
      >
        <AdminSidebar 
          onClose={() => setIsMobileSidebarOpen(false)} 
          isCollapsed={!isDesktopSidebarOpen}
          onToggleCollapse={toggleDesktopSidebar}
        />
      </div>

      {/* Main Content */}
      <main className="w-full min-h-screen p-6 md:p-10 pt-20 px-8 md:px-12 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;