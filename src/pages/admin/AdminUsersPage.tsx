import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, MoreVertical, Plus, Shield } from 'lucide-react';
import { CreateAdminModal } from '../../components/admin/CreateAdminModal';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
    checkSuperAdminStatus();
  }, []);

  const checkSuperAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminData, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsSuperAdmin(adminData?.role === 'super_admin');
    } catch (error) {
      console.error('Error checking super admin status:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          goals (count),
          workout_logs (count),
          bookings (count)
        `);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-light">
          Users
        </h1>
        {isSuperAdmin && (
          <Button
            variant="primary"
            leftIcon={<Shield className="w-4 h-4" />}
            onClick={() => setIsCreateAdminModalOpen(true)}
          >
            Create Admin
          </Button>
        )}
      </div>

      <Card className="mb-6 md:mb-8">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-dark border border-primary/20 rounded-lg py-2 pl-10 pr-4 text-light placeholder-light/30 focus:outline-none focus:border-primary"
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filter
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="text-left border-b border-primary/10">
                    <th className="py-4 px-6 text-light/70 font-medium">Name</th>
                    <th className="py-4 px-6 text-light/70 font-medium">Email</th>
                    <th className="py-4 px-6 text-light/70 font-medium">Status</th>
                    <th className="py-4 px-6 text-light/70 font-medium">Goals</th>
                    <th className="py-4 px-6 text-light/70 font-medium">Workouts</th>
                    <th className="py-4 px-6 text-light/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-primary/10">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <img
                            src={user.avatar_url || 'https://via.placeholder.com/32'}
                            alt={user.first_name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-light font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-light/50">
                              {user.city}, {user.state}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-light/70">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-6 text-light/70">{user.goals_count}</td>
                      <td className="py-4 px-6 text-light/70">{user.workout_logs_count}</td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-primary/10">
                {users.map((user: any) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={user.avatar_url || 'https://via.placeholder.com/32'}
                          alt={user.first_name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-light font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-light/50">
                            {user.city}, {user.state}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-light/70">Email</span>
                        <span className="text-light">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-light/70">Status</span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light/70">Goals</span>
                        <span className="text-light">{user.goals_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light/70">Workouts</span>
                        <span className="text-light">{user.workout_logs_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default AdminUsersPage;