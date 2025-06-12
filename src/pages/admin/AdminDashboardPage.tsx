import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Users, Activity, Calendar, TrendingUp, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import UserGrowthChart from '../../components/admin/UserGrowthChart';
import UserManagement from '../../components/admin/UserManagement';
import ClientManagement from '../../components/admin/ClientManagement';
import UpcomingAppointments from '../../components/admin/UpcomingAppointments';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in?: string;
  status?: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  totalRevenue: number;
  recentUsers: User[];
  allUsers: User[];
  allClients: Client[];
  recentBookings: any[];
  userGrowthData: { date: string; users: number }[];
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status?: string;
  created_at: string;
  last_session?: string;
  membership_type?: string;
  membership_status?: string;
  notes?: string;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentUsers: [],
    allUsers: [],
    allClients: [],
    recentBookings: [],
    userGrowthData: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate mock user growth data
  const generateUserGrowthData = () => {
    const data = [];
    const today = new Date();
    let users = Math.floor(Math.random() * 50) + 10; // Start with random number between 10-60
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add some random growth
      users += Math.floor(Math.random() * 15) - 5; // Random change between -5 and +10
      users = Math.max(users, 0); // Ensure we don't go negative
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: users
      });
    }
    
    return data;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
      
      // Fetch active users - for now, we'll just use a percentage of total users as active
      // since the last_sign_in field might not exist in the profiles table
      let activeUsers = 0;
      try {
        // Try to get users with last_sign_in field if it exists
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('last_sign_in', thirtyDaysAgo.toISOString());
          
        if (!error && count !== null) {
          activeUsers = count;
        } else {
          // Fallback: estimate active users as 60-80% of total users
          activeUsers = Math.floor((totalUsers || 0) * (0.6 + Math.random() * 0.2));
        }
      } catch (err) {
        console.log('Error fetching active users, using estimate instead:', err);
        // Fallback: estimate active users as 60-80% of total users
        activeUsers = Math.floor((totalUsers || 0) * (0.6 + Math.random() * 0.2));
      }
      
      // Fetch total bookings
      const { count: totalBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      // If bookings table doesn't exist, we'll just use 0
      const finalBookings = bookingsError ? 0 : totalBookings || 0;
      
      // Fetch recent users - only select fields we know exist
      const { data: recentUsers, error: recentUsersError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentUsersError) throw new Error(`Error fetching recent users: ${recentUsersError.message}`);
      
      // Process recent users to add missing fields if needed
      const processedRecentUsers = recentUsers?.map(user => ({
        ...user,
        full_name: (user as any).full_name || user.email?.split('@')[0] || 'Unknown',
        last_sign_in: (user as any).last_sign_in || user.created_at,
        status: (user as any).status || 'active'
      })) || [];
      
      // Fetch all users for management table - only select fields we know exist
      const { data: allUsersRaw, error: allUsersError } = await supabase
        .from('profiles')
        .select('id, email, created_at, full_name, last_sign_in, status')
        .order('created_at', { ascending: false });

      if (allUsersError) {
        console.error('Error fetching all users:', allUsersError);
      }

      // Process all users to add missing fields if needed
      const allUsers = allUsersRaw?.map(user => ({
        ...user,
        full_name: (user as any).full_name || user.email?.split('@')[0] || 'Unknown',
        last_sign_in: (user as any).last_sign_in || user.created_at,
        status: (user as any).status || 'active'
      })) || [];
      
      // Fetch all clients
      let allClients: Client[] = [];
      try {
        // Check if clients table exists
        const { error: clientsTableError } = await supabase
          .from('clients')
          .select('count')
          .limit(1);
          
        if (!clientsTableError) {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (clientsError) {
            console.error('Error fetching clients:', clientsError);
          } else {
            // Process clients to ensure all fields exist
            allClients = clientsData?.map(client => ({
              ...client,
              full_name: client.full_name || 'Unknown Client',
              membership_status: client.membership_status || 'active',
              membership_type: client.membership_type || 'monthly'
            })) || [];
          }
        } else {
          console.log('Clients table may not exist yet:', clientsTableError);
          // Generate some sample clients for demonstration
          allClients = generateSampleClients(5);
        }
      } catch (error) {
        console.error('Error in client data fetching:', error);
        // Fallback to sample data
        allClients = generateSampleClients(5);
      }
      
      // Generate user growth data (simulated for now)
      // In a real app, you would query the database for this data
      const userGrowthData = generateUserGrowthData();
      
      // Calculate estimated revenue (this would normally come from a payments table)
      // For now, we'll use a placeholder calculation
      const estimatedRevenue = finalBookings * 50; // Assuming $50 per booking
      
      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalBookings: finalBookings,
        totalRevenue: estimatedRevenue,
        recentUsers: processedRecentUsers,
        allUsers: allUsers,
        allClients: allClients,
        recentBookings: [],
        userGrowthData
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-light/70">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-500 font-medium mb-2">Error loading dashboard</p>
        <p className="text-light/70 text-sm text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-light">
          Dashboard
        </h1>
        <button 
          onClick={fetchDashboardData} 
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <Users className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Total Users</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">{stats.totalUsers.toLocaleString()}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <Activity className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Active Users</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">{stats.activeUsers.toLocaleString()}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <Calendar className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Total Bookings</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">{stats.totalBookings.toLocaleString()}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="w-10 md:w-12 h-10 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-3 md:mr-4">
                <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-light/70 text-sm">Revenue</p>
                <h3 className="text-xl md:text-2xl font-semibold text-light">${stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Users Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-light mb-4">Recent Users</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm text-light">{user.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-light">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-light/70">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-light/50">No recent users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Two-column layout for charts and upcoming appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Growth Chart - Takes up 2/3 of the space */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-light mb-4">User Growth (Last 7 Days)</h2>
          <Card>
            <CardBody>
              <div className="h-64">
                {stats.userGrowthData.length > 0 ? (
                  <UserGrowthChart data={stats.userGrowthData} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-light/50">No growth data available</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Upcoming Appointments - Takes up 1/3 of the space */}
        <div>
          <h2 className="text-xl font-semibold text-light mb-4">Quick Actions</h2>
          <UpcomingAppointments limit={3} />
        </div>
      </div>
      
      {/* User Management Section */}
      <div className="mb-8">
          <UserManagement 
            users={stats.allUsers} 
            loading={loading} 
            onRefresh={fetchDashboardData} 
          />
          
          <div className="mt-8"></div>
          
          <ClientManagement 
            clients={stats.allClients} 
            loading={loading} 
            onRefresh={fetchDashboardData} 
          />
      </div>
    </div>
  );
};

// Helper function to generate sample clients when the table doesn't exist yet
const generateSampleClients = (count: number): Client[] => {
  const membershipTypes = ['monthly', 'quarterly', 'annual', 'trial'];
  const membershipStatuses = ['active', 'pending', 'expired', 'cancelled'];
  const sampleClients: Client[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days
    
    const lastSessionDate = new Date(createdDate);
    lastSessionDate.setDate(lastSessionDate.getDate() + Math.floor(Math.random() * 30)); // Random session after join date
    
    sampleClients.push({
      id: `sample-${i + 1}`,
      full_name: `Sample Client ${i + 1}`,
      email: `client${i + 1}@example.com`,
      phone: `(555) ${100 + i}-${1000 + i}`,
      created_at: createdDate.toISOString(),
      last_session: lastSessionDate.toISOString(),
      membership_type: membershipTypes[Math.floor(Math.random() * membershipTypes.length)],
      membership_status: membershipStatuses[Math.floor(Math.random() * membershipStatuses.length)],
      notes: 'This is a sample client for demonstration purposes.'
    });
  }
  
  return sampleClients;
};

export default AdminDashboardPage;