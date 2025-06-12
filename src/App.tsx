import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import LogWorkoutPage from './pages/LogWorkoutPage';
import MessagingPage from './pages/MessagingPage';
import SettingsPage from './pages/SettingsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminFinancialsPage from './pages/admin/AdminFinancialsPage';
import AdminMessagingPage from './pages/admin/AdminMessagingPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SchedulingPage from './pages/admin/SchedulingPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import MealPlanningPage from './pages/admin/MealPlanningPage';
import CreateMealPlanPage from './pages/admin/CreateMealPlanPage';
import EditMealPlanPage from './pages/admin/EditMealPlanPage';
import MealPlanDetailPage from './pages/admin/MealPlanDetailPage';
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
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminLoginPage />} />
        <Route element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="financials" element={<AdminFinancialsPage />} />
          <Route path="messaging" element={<AdminMessagingPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="scheduling" element={<SchedulingPage />} />
          <Route path="meal-planning" element={<MealPlanningPage />} />
          <Route path="meal-planning/create" element={<CreateMealPlanPage />} />
          <Route path="meal-planning/edit/:id" element={<EditMealPlanPage />} />
          <Route path="meal-planning/:id" element={<MealPlanDetailPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
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
        <Route path="/messages" element={<MessagingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;