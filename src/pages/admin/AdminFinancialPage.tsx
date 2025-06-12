import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Section } from '../../components/ui/Section';
import { BarChart2, DollarSign, TrendingUp, Calendar, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays } from 'date-fns';

interface FinancialStats {
  key: string;
  label: string;
  totalRevenue: number;
  totalBookings: number;
  revenueThisMonth: number;
  revenueGrowth: string;
  recent: any[];
}

const AdminFinancialPage: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialStats();
  }, []);

  const fetchFinancialStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all bookings with payments
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, service_id, date, status, created_at, services(price, category, name)')
        .eq('status', 'confirmed');

      if (bookingsError) throw bookingsError;
      // Each booking now has a 'services' field (array with one item) containing price
      const bookingsWithPrice = bookings.map((b: any) => ({
        ...b,
        price: b.services?.[0]?.price || 0,
        category: b.services?.[0]?.category || '',
        serviceName: b.services?.[0]?.name || '',
        service_id: b.service_id,
        created_at: b.created_at,
      }));

      // Service categories
      const categories = [
        { key: 'Personal Training', label: 'Personal Training' },
        { key: 'Massage/Body Work', label: 'Massage/Body Work' },
      ];

      // Calculate stats by category
      const statsByCategory = categories.map(cat => {
        const catBookings = bookingsWithPrice.filter(b => (b.category || '').toLowerCase().includes(cat.key.toLowerCase()));
        const totalRevenue = catBookings.reduce((sum: number, b: any) => sum + (b.price || 0), 0);
        const totalBookings = catBookings.length;
        const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
        const revenueThisMonth = catBookings.filter((b: any) => b.date >= startOfMonth).reduce((sum: number, b: any) => sum + (b.price || 0), 0);
        const today = new Date();
        const last30 = subDays(today, 30);
        const prev30 = subDays(today, 60);
        const last30Revenue = catBookings.filter((b: any) => new Date(b.date) >= last30).reduce((sum: number, b: any) => sum + (b.price || 0), 0);
        const prev30Revenue = catBookings.filter((b: any) => new Date(b.date) >= prev30 && new Date(b.date) < last30).reduce((sum: number, b: any) => sum + (b.price || 0), 0);
        const revenueGrowth = prev30Revenue === 0 ? '+0%' : `${(((last30Revenue - prev30Revenue) / prev30Revenue) * 100).toFixed(1)}%`;
        const recent = catBookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
        return {
          ...cat,
          totalRevenue,
          totalBookings,
          revenueThisMonth,
          revenueGrowth,
          recent,
        };
      });

      // --- Subscriptions financials ---
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, status, price, started_at, cancelled_at, renewed_at')
        .in('status', ['active', 'cancelled'])
        .order('started_at', { ascending: false });
      if (subscriptionsError) throw subscriptionsError;

      // Group by plan
      const plans = [
        { key: 'basic', label: 'Basic Membership' },
        { key: 'pro', label: 'Pro Membership' },
        { key: 'elite', label: 'Elite Membership' },
      ];
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const today = new Date();
      const last30 = subDays(today, 30);
      const prev30 = subDays(today, 60);
      const statsByPlan = plans.map(plan => {
        const planSubs = subscriptions.filter((s: any) => s.plan_id === plan.key);
        const totalRevenue = planSubs.reduce((sum: number, s: any) => sum + (s.price || 0), 0);
        const totalActive = planSubs.filter((s: any) => s.status === 'active').length;
        const revenueThisMonth = planSubs.filter((s: any) => s.started_at >= startOfMonth).reduce((sum: number, s: any) => sum + (s.price || 0), 0);
        const last30Revenue = planSubs.filter((s: any) => new Date(s.started_at) >= last30).reduce((sum: number, s: any) => sum + (s.price || 0), 0);
        const prev30Revenue = planSubs.filter((s: any) => new Date(s.started_at) >= prev30 && new Date(s.started_at) < last30).reduce((sum: number, s: any) => sum + (s.price || 0), 0);
        const revenueGrowth = prev30Revenue === 0 ? '+0%' : `${(((last30Revenue - prev30Revenue) / prev30Revenue) * 100).toFixed(1)}%`;
        const recent = planSubs.slice(0, 10);
        return {
          key: `subscription-${plan.key}`,
          label: plan.label,
          totalRevenue,
          totalBookings: totalActive, // For subscriptions, this is active count
          revenueThisMonth,
          revenueGrowth,
          recent,
        };
      });

      setStats([...statsByCategory, ...statsByPlan]);
      setRecentTransactions([]); // Not used anymore

    } catch (err: any) {
      setError('Error fetching financial data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="pt-32 min-h-screen bg-gradient-radial">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-display font-bold text-light mb-2">Financial Overview</h1>
        <p className="text-light/70 mb-6">Track revenue, bookings, and recent transactions.</p>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {stats.map((catStat) => (
              <div key={catStat.key} className="mb-12">
                <h2 className="text-2xl font-bold text-light mb-4">{catStat.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <DollarSign className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="text-lg font-bold text-light">${catStat.totalRevenue.toLocaleString()}</div>
                        <div className="text-light/70 text-sm">Total Revenue</div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                      <div>
                        <div className="text-lg font-bold text-light">{catStat.revenueGrowth}</div>
                        <div className="text-light/70 text-sm">Revenue Growth (30d)</div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <Calendar className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="text-lg font-bold text-light">${catStat.revenueThisMonth.toLocaleString()}</div>
                        <div className="text-light/70 text-sm">Revenue This Month</div>
                      </div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="flex items-center gap-4">
                      <BarChart2 className="w-8 h-8 text-purple-400" />
                      <div>
                        <div className="text-lg font-bold text-light">{catStat.totalBookings}</div>
                        <div className="text-light/70 text-sm">Total Bookings</div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
                {/* Recent Transactions for this service */}
                <Card>
                  <CardBody>
                    <div className="flex items-center gap-4 mb-4">
                      <DollarSign className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold text-light">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-light/90">
                        <thead>
                          <tr>
                            <th className="text-left py-2 px-4">Date</th>
                            <th className="text-left py-2 px-4">Booking ID</th>
                            <th className="text-left py-2 px-4">Amount</th>
                            <th className="text-left py-2 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catStat.recent.map((tx) => (
                            <tr key={tx.id}>
                              <td className="py-2 px-4">{format(new Date(tx.date), 'yyyy-MM-dd')}</td>
                              <td className="py-2 px-4">{tx.id}</td>
                              <td className="py-2 px-4">${tx.price?.toLocaleString() ?? 0}</td>
                              <td className="py-2 px-4 capitalize">{tx.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </>
        )}
      </div>
    </Section>
  );
};

export default AdminFinancialPage;
