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
  AlertCircle
} from 'lucide-react';
import { Section } from '../components/ui/Section';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BackButton } from '../components/ui/BackButton';

const SettingsPage = () => {
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
        marketing: false
      },
      push: {
        workouts: false,
        goals: false,
        community: false,
        marketing: false
      }
    },
    measurement_unit: 'metric'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
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
        setProfile(prev => ({
          ...prev,
          ...data,
          notification_preferences: {
            email: {
              ...prev.notification_preferences.email,
              ...(data.notification_preferences?.email || {})
            },
            push: {
              ...prev.notification_preferences.push,
              ...(data.notification_preferences?.push || {})
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion with confirmation
    console.log('Delete account');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Section className="pt-32 min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <BackButton to="/dashboard" className="mb-6" />
          <h1 className="text-3xl font-display font-bold text-light mb-2">
            Settings
          </h1>
          <p className="text-light/70">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Profile</h2>
                <p className="text-light/70 text-sm">
                  Update your personal information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.first_name}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.last_name}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={profile.state}
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding')}
              >
                Edit Profile
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Notifications</h2>
                <p className="text-light/70 text-sm">
                  Choose what updates you want to receive
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-light mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(profile.notification_preferences?.email || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-light/70 capitalize">{key}</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          className="sr-only peer"
                          onChange={() => {
                            setProfile(prev => ({
                              ...prev,
                              notification_preferences: {
                                ...prev.notification_preferences,
                                email: {
                                  ...prev.notification_preferences.email,
                                  [key]: !value
                                }
                              }
                            }));
                          }}
                        />
                        <div className="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-light mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(profile.notification_preferences?.push || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-light/70 capitalize">{key}</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          className="sr-only peer"
                          onChange={() => {
                            setProfile(prev => ({
                              ...prev,
                              notification_preferences: {
                                ...prev.notification_preferences,
                                push: {
                                  ...prev.notification_preferences.push,
                                  [key]: !value
                                }
                              }
                            }));
                          }}
                        />
                        <div className="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="primary">Save Changes</Button>
            </div>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Security</h2>
                <p className="text-light/70 text-sm">
                  Manage your account security settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-dark rounded-lg hover:bg-dark-surface transition-colors">
                <div>
                  <h3 className="font-medium text-light">Change Password</h3>
                  <p className="text-sm text-light/70">Update your password</p>
                </div>
                <ChevronRight className="w-5 h-5 text-light/50" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-dark rounded-lg hover:bg-dark-surface transition-colors">
                <div>
                  <h3 className="font-medium text-light">Two-Factor Authentication</h3>
                  <p className="text-sm text-light/70">Add an extra layer of security</p>
                </div>
                <ChevronRight className="w-5 h-5 text-light/50" />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Payment Methods</h2>
                <p className="text-light/70 text-sm">
                  Manage your payment information
                </p>
              </div>
            </div>

            <button 
              className="w-full flex items-center justify-between p-4 bg-dark rounded-lg hover:bg-dark-surface transition-colors"
              onClick={() => navigate('/payment-methods')}
            >
              <div>
                <h3 className="font-medium text-light">Manage Payment Methods</h3>
                <p className="text-sm text-light/70">Add or remove payment methods</p>
              </div>
              <ChevronRight className="w-5 h-5 text-light/50" />
            </button>
          </CardBody>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Danger Zone</h2>
                <p className="text-light/70 text-sm">
                  Irreversible account actions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
              >
                Sign Out
              </Button>

              <Button
                variant="ghost"
                fullWidth
                leftIcon={<Trash2 className="w-5 h-5 text-red-500" />}
                className="text-red-500 hover:bg-red-500/10"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Section>
  );
};

export default SettingsPage;