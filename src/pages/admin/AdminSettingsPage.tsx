import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
  Trash2,
  LogOut,
  AlertCircle,
  Users as AdminsIcon,
  Server,
  Settings as SiteSettingsIcon,
} from 'lucide-react';
import { Section } from '../../components/ui/Section';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BackButton } from '../../components/ui/BackButton';

const AdminSettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    notification_preferences: {
      email: {
        workouts: false,
        goals: false,
        community: false,
        marketing: false,
      },
      push: {
        workouts: false,
        goals: false,
        community: false,
        marketing: false,
      },
    },
    measurement_unit: 'metric',
    role: '',
    positions: [],
  });
  const positionOptions = [
    'Personal Trainer',
    'Massage Therapist',
    'Nutritionist',
    'Wellness Coach',
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    supabase: 'online',
    payments: 'online',
    email: 'online',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAdmins();
      // Simulate system status check
      setSystemStatus({
        supabase: 'online',
        payments: 'online',
        email: 'online',
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      if (data) {
        setProfile((prev) => ({
          ...prev,
          ...data,
          notification_preferences: {
            email: {
              ...prev.notification_preferences.email,
              ...(data.notification_preferences?.email || {}),
            },
            push: {
              ...prev.notification_preferences.push,
              ...(data.notification_preferences?.push || {}),
            },
          },
        }));
        setEditProfile(null); // Reset edit state on fetch
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('role', ['admin', 'superadmin', 'site_manager']);
      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login'); // Redirect to admin login after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion with confirmation
    alert('Account deletion is not yet implemented.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handlers for editing profile
  const handleEditProfile = () => {
    setEditProfile(profile);
    setIsEditing(true);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  const handlePositionsChange = (position: string) => {
    if (!editProfile) return;
    let updatedPositions = Array.isArray(editProfile.positions) ? [...editProfile.positions] : [];
    if (updatedPositions.includes(position)) {
      updatedPositions = updatedPositions.filter((p) => p !== position);
    } else {
      updatedPositions.push(position);
    }
    setEditProfile({ ...editProfile, positions: updatedPositions });
  };

  const handleNotificationPreferenceChange = (type: 'email' | 'push', key: string) => {
    if (!editProfile) return;
    setEditProfile({
      ...editProfile,
      notification_preferences: {
        ...editProfile.notification_preferences,
        [type]: {
          ...editProfile.notification_preferences[type],
          [key]: !editProfile.notification_preferences[type][key],
        },
      },
    });
  };

  const handleCancelEdit = () => {
    setEditProfile(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!editProfile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editProfile.first_name,
          last_name: editProfile.last_name,
          email: editProfile.email,
          positions: editProfile.positions,
          notification_preferences: editProfile.notification_preferences,
        })
        .eq('id', user?.id);
      if (error) throw error;
      setProfile({ ...profile, ...editProfile });
      setIsEditing(false);
      setEditProfile(null);
      // Show a toast/snackbar on success
      const toast = document.createElement('div');
      toast.textContent = 'Profile updated successfully!';
      toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-dark px-6 py-3 rounded-lg shadow-lg z-50 font-semibold text-sm animate-fade-in';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => document.body.removeChild(toast), 900);
      }, 1800);
    } catch (error) {
      alert('Failed to update profile.');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

// Tailwind CSS for fade-in/fade-out animations
// Add these to your global styles if not present:
// .animate-fade-in { animation: fadeIn 0.3s; }
// .animate-fade-out { animation: fadeOut 0.7s forwards; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

  return (
    <Section className="pt-32 min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <BackButton to="/admin/dashboard" className="mb-6" />
          <h1 className="text-3xl font-display font-bold text-light mb-2">Admin Settings</h1>
          <p className="text-light/70">Manage admin account, site settings, and integrations</p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Profile</h2>
                <p className="text-light/70 text-sm">Admin information</p>
              </div>
              <div className="ml-auto">
                {!isEditing ? (
                  <Button variant="outline" onClick={handleEditProfile}>Edit Profile</Button>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={isEditing && editProfile ? editProfile.first_name : profile.first_name}
                  onChange={isEditing ? handleProfileChange : undefined}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={isEditing && editProfile ? editProfile.last_name : profile.last_name}
                  onChange={isEditing ? handleProfileChange : undefined}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={isEditing && editProfile ? editProfile.email : profile.email}
                  onChange={isEditing ? handleProfileChange : undefined}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">Role</label>
                <input
                  type="text"
                  value={profile.role}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-light/70 mb-2">Positions</label>
                <span className="text-xs text-light/50 mb-2 block">Select one or more specialties you provide. These will be visible to other admins.</span>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {positionOptions.map((option) => {
                      const selected = editProfile?.positions?.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          aria-label={option}
                          onClick={() => handlePositionsChange(option)}
                          className={`px-3 py-1 rounded-full border transition-colors duration-150 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/70 ${selected ? 'bg-primary text-dark border-primary shadow' : 'bg-dark border-primary/40 text-light/70 hover:bg-primary/20'}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profile.positions && profile.positions.length > 0)
                      ? profile.positions.map((pos: string) => (
                          <span key={pos} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                            {pos}
                          </span>
                        ))
                      : <span className="text-light/50">No positions selected</span>}
                  </div>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="flex gap-3 mt-6">
                <Button variant="primary" onClick={handleSaveProfile}>Save</Button>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </div>
            ) : null}
          </CardBody>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Notification Preferences</h2>
                <p className="text-light/70 text-sm">Manage email and push notifications</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-light mb-2">Email Notifications</h3>
                {Object.keys(profile.notification_preferences.email).map((key) => (
                  <div key={key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={isEditing && editProfile ? editProfile.notification_preferences.email[key] : profile.notification_preferences.email[key]}
                      onChange={isEditing ? () => handleNotificationPreferenceChange('email', key) : undefined}
                      className="mr-2"
                    />
                    <span className="text-light/70 capitalize">{key}</span>
                  </div>
                ))} 
              </div>
              <div>
                <h3 className="font-semibold text-light mb-2">Push Notifications</h3>
                {Object.keys(profile.notification_preferences.push).map((key) => (
                  <div key={key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={isEditing && editProfile ? editProfile.notification_preferences.push[key] : profile.notification_preferences.push[key]}
                      onChange={isEditing ? () => handleNotificationPreferenceChange('push', key) : undefined}
                      className="mr-2"
                    />
                    <span className="text-light/70 capitalize">{key}</span>
                  </div>
                ))} 
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Admin Tools */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <AdminsIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Admin Tools</h2>
                <p className="text-light/70 text-sm">Manage other admins</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-light/90">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="py-2 px-4">{admin.first_name} {admin.last_name}</td>
                      <td className="py-2 px-4">{admin.email}</td>
                      <td className="py-2 px-4">{admin.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="primary" className="mt-4" disabled>
              Invite New Admin (Coming Soon)
            </Button>
          </CardBody>
        </Card>

        {/* Site/System Status */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">System Status</h2>
                <p className="text-light/70 text-sm">Integrations and service health</p>
              </div>
            </div>
            <ul className="text-light/80">
              <li>Supabase: <span className={systemStatus.supabase === 'online' ? 'text-green-400' : 'text-red-400'}>{systemStatus.supabase}</span></li>
              <li>Payments: <span className={systemStatus.payments === 'online' ? 'text-green-400' : 'text-red-400'}>{systemStatus.payments}</span></li>
              <li>Email: <span className={systemStatus.email === 'online' ? 'text-green-400' : 'text-red-400'}>{systemStatus.email}</span></li>
            </ul>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
                <p className="text-light/70 text-sm">Delete your account or log out</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="destructive" onClick={handleDeleteAccount} disabled>
                <Trash2 className="w-5 h-5 mr-2" /> Delete Account (Coming Soon)
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-2" /> Log Out
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Section>
  );
};

export default AdminSettingsPage;
