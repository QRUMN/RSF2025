import React from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Bell, 
  Mail, 
  Globe, 
  Shield, 
  Key,
  Database,
  HardDrive,
  AlertTriangle
} from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 md:mb-8">
        Settings
      </h1>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">General Settings</h2>
                <p className="text-light/70 text-sm">Configure basic system settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  defaultValue="Ready Set Fit"
                  className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light/70 mb-2">
                  Time Zone
                </label>
                <select className="w-full bg-dark border border-primary/20 rounded-lg py-2 px-4 text-light focus:outline-none focus:border-primary">
                  <option>UTC-05:00 Eastern Time</option>
                  <option>UTC-06:00 Central Time</option>
                  <option>UTC-07:00 Mountain Time</option>
                  <option>UTC-08:00 Pacific Time</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Security</h2>
                <p className="text-light/70 text-sm">Manage security settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-light">Two-Factor Authentication</p>
                    <p className="text-sm text-light/70">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-light">Session Management</p>
                    <p className="text-sm text-light/70">Manage active sessions</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-light">Notifications</h2>
                <p className="text-light/70 text-sm">Configure notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-light">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <span className="text-light">Backup Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <span className="text-light">Security Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;