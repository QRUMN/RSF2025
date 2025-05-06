import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Activity, Calendar, TrendingUp, UserCog, BarChart2, Clock, Link2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileCard } from '../../components/admin/ProfileCard';

const quickLinks = [
  { label: 'User Management', icon: <UserCog className="w-5 h-5 text-primary" />, href: '/admin/users' },
  { label: 'Site Analytics', icon: <BarChart2 className="w-5 h-5 text-primary" />, href: '/admin/analytics' },
  { label: 'Recent Activity', icon: <Clock className="w-5 h-5 text-primary" />, href: '/admin/activity' },
  { label: 'Settings', icon: <Link2 className="w-5 h-5 text-primary" />, href: '/admin/settings' },
];

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) setProfile(data);
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (updated: any) => {
    setProfileLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updated.first_name,
        last_name: updated.last_name,
        email: updated.email,
        positions: updated.positions,
        notification_preferences: updated.notification_preferences,
      })
      .eq('id', user.id);
    if (!error) {
      setProfile(updated);
      // Show toast
      const toast = document.createElement('div');
      toast.textContent = 'Profile updated successfully!';
      toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-dark px-6 py-3 rounded-lg shadow-lg z-50 font-semibold text-sm animate-fade-in';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 900);
      }, 1800);
    }
    setProfileLoading(false);
  };

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [totalBookings, setTotalBookings] = useState<number | null>(null);
  const [growthRate, setGrowthRate] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch total users
        const { count: userCount, error: userCountError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (userCountError) {
          setError('Error fetching user count: ' + userCountError.message);
          console.error('User count error:', userCountError);
        }
        setTotalUsers(userCount || 0);

        // Fetch active users (signed up or logged in last 30 days)
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 30);
        const sinceISOString = sinceDate.toISOString();
        const { count: activeCount, error: activeError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sinceISOString);
        if (activeError) {
          setError('Error fetching active users: ' + activeError.message);
          console.error('Active users error:', activeError);
        }
        setActiveUsers(activeCount || 0);

        // Fetch total bookings
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
        if (bookingsError) {
          setError('Error fetching bookings: ' + bookingsError.message);
          console.error('Bookings error:', bookingsError);
        }
        setTotalBookings(bookingsCount || 0);

        // Fetch growth rate (user signups last 30 days vs previous 30)
        const prevSinceDate = new Date();
        prevSinceDate.setDate(prevSinceDate.getDate() - 60);
        const prevSinceISOString = prevSinceDate.toISOString();
        const { count: prevCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', prevSinceISOString)
          .lt('created_at', sinceISOString);
        const growth = prevCount && prevCount > 0 ? Math.round(((activeCount - prevCount) / prevCount) * 100) : 0;
        setGrowthRate(`${growth >= 0 ? '+' : ''}${growth}%`);

        // Fetch 5 most recent users
        const { data: recent, error: recentError } = await supabase
          .from('profiles')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (recentError) {
          setError('Error fetching recent users: ' + recentError.message);
          console.error('Recent users error:', recentError);
        }
        setRecentUsers(recent || []);

        // Fetch 5 most recent bookings
        const { data: bookings, error: recentBookingsError } = await supabase
          .from('bookings')
          .select('id, user_id, date, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        if (recentBookingsError) {
          setError('Error fetching recent bookings: ' + recentBookingsError.message);
          console.error('Recent bookings error:', recentBookingsError);
        }
        setRecentBookings(bookings || []);
      } catch (err) {
        setError('Unexpected error: ' + (err as Error).message);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Users', value: totalUsers !== null ? totalUsers : '...', icon: <Users className="w-6 h-6 text-primary" /> },
    { label: 'Active Users', value: activeUsers !== null ? activeUsers : '...', icon: <Activity className="w-6 h-6 text-primary" /> },
    { label: 'Total Bookings', value: totalBookings !== null ? totalBookings : '...', icon: <Calendar className="w-6 h-6 text-primary" /> },
    { label: 'Growth Rate', value: growthRate !== null ? growthRate : '+0%', icon: <TrendingUp className="w-6 h-6 text-primary" /> },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {profile && (
        <div className="mb-8">
          <ProfileCard profile={profile} onSave={handleSaveProfile} loading={profileLoading} />
        </div>
      )}
      <div className="bg-yellow-400 text-black text-2xl font-extrabold p-4 mb-6 rounded-lg text-center">
        DASHBOARD MOUNTED TEST
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold text-light mb-6">Welcome, Admin!</h1>
      <p className="text-light/70 mb-8 text-lg">Here’s an overview of your platform’s key metrics and admin tools.</p>

      {/* Error State */}
      {error && (
        <div className="bg-red-800/20 border border-red-600 text-red-200 p-4 rounded-lg mb-8">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats Cards (always render) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-dark-700 rounded-xl p-5 flex items-center shadow min-h-[90px]">
            <div className="bg-primary/20 rounded-lg p-3 mr-4 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-light/70 text-sm">{stat.label}</p>
              <h3 className="text-2xl font-semibold text-light">{stat.value ?? '—'}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-dark-700 rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold text-light mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 rounded-lg px-4 py-2 text-light font-medium transition"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-dark-700 rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold text-light mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-light/60">Loading...</div>
          ) : error ? (
            <div className="text-red-400">Could not load recent activity.</div>
          ) : (
            <ul className="divide-y divide-dark-500">
              {recentUsers.length === 0 && recentBookings.length === 0 && (
                <li className="py-2 text-light/60">No recent activity.</li>
              )}
              {/* Recent signups */}
              {recentUsers.map((user, idx) => (
                <li key={"signup-" + idx} className="py-2 text-light/80">
                  <b>{user.email}</b> joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </li>
              ))}
              {/* Recent bookings */}
              {recentBookings.map((booking, idx) => (
                <li key={"booking-" + idx} className="py-2 text-light/80">
                  Booking <b>{booking.id}</b> by user <b>{booking.user_id}</b> on {booking.date ? new Date(booking.date).toLocaleDateString() : '—'} ({booking.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Analytics Placeholder (always render) */}
      <div className="bg-dark-700 rounded-xl p-6 shadow mb-10">
        <h2 className="text-xl font-bold text-light mb-4">Site Analytics</h2>
        <div className="text-light/60">[Analytics charts and insights coming soon]</div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;