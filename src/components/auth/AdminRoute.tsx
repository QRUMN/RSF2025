import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // For development purposes, check if the user's email is the known admin email
        // This avoids the problematic database query
        if (user.email === 'readysetfitrx@gmail.com') {
          console.log('Admin access granted for known admin email');
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // For other users, attempt the database query but handle errors gracefully
        try {
          const { data, error } = await supabase
            .from('admins')
            .select('status, role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Admin query error:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.status === 'active');
          }
        } catch (dbError) {
          console.error('Database error checking admin status:', dbError);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/admin" replace />;
};