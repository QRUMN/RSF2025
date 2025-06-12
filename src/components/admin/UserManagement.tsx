import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Search, UserPlus, Edit } from 'lucide-react';
import AddUserModal from './AddUserModal';
import UserDetailsModal from './UserDetailsModal';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in?: string;
  status?: string;
}

interface UserManagementProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
  };
  
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-light">User Management</h2>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <button 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-light/70">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-light/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-light/50">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="px-4 py-3 text-sm text-light">{user.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-light">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-light/70">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-light/70">
                      {user.last_sign_in 
                        ? new Date(user.last_sign_in).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        className="text-light/50 hover:text-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-light/50">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                    <button 
                      onClick={onRefresh} 
                      className="block mx-auto mt-2 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-medium transition-colors"
                    >
                      Refresh Data
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        onUserAdded={onRefresh} 
      />
      
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        user={selectedUser}
        onUserUpdated={onRefresh}
      />
    </div>
  );
};

export default UserManagement;
