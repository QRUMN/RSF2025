import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import SettingsPage from './pages/SettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminFinancialPage from './pages/admin/AdminFinancialPage';
import MealPlansPage from './pages/admin/MealPlansPage';
import AdminLayout from './components/layout/AdminLayout';
import Layout from './components/layout/Layout';
import { AdminRoute } from './components/auth/AdminRoute';

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Admin Login - no sidebar */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Section - with sidebar */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route element={<AdminRoute allowedRoles={['superadmin', 'admin']} />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="financial" element={<AdminFinancialPage />} />
          <Route path="meal-plans" element={<MealPlansPage />} />
        </Route>
      </Route>

      {/* User Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/log-workout" element={<LogWorkoutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;