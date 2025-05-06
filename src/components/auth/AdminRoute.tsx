import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AdminRouteProps {
  allowedRoles: string[];
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAllowed(data && allowedRoles.includes(data.role));
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAllowed ? <Outlet /> : <Navigate to="/admin/login" replace />;
};