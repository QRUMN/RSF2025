import React, { useState } from 'react';
import MealPlanBuilder from '../../components/admin/MealPlanBuilder';
import { Utensils } from 'lucide-react';

// Placeholder meal plans data
const mealPlans = [
  {
    id: '1',
    name: 'Spring Shred 90',
    client: 'Ape Jawn',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Muscle Gain 90',
    client: 'Jane Smith',
    status: 'Draft',
  },
];

const client = {
  id: '', // Will be loaded from DB or set later
  name: 'Ape Jawn',
};

const AdminMealPlansPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [search, setSearch] = useState('');

  const filteredPlans = mealPlans.filter(plan =>
    plan.name.toLowerCase().includes(search.toLowerCase()) ||
    plan.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Utensils style={{ color: '#1976d2' }} /> Admin Meal Plans
        </h1>
        <button
          onClick={() => setShowBuilder(true)}
          style={{ background: '#1976d2', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6 }}
        >
          + Create Meal Plan
        </button>
      </div>
      <p style={{ color: '#666', margin: '8px 0 24px 0' }}>
        Create, edit, and assign 90-day meal plans to your clients.
      </p>
      <input
        type="text"
        placeholder="Search meal plans or clients..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', marginBottom: 24 }}
      />
      {filteredPlans.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: 48 }}>
          <Utensils style={{ width: 48, height: 48, opacity: 0.2 }} />
          <div style={{ marginTop: 16 }}>No meal plans found.</div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>Plan Name</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Assigned Client</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map(plan => (
              <tr key={plan.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{plan.name}</td>
                <td style={{ padding: 12 }}>{plan.client}</td>
                <td style={{ padding: 12 }}>{plan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showBuilder && (
        <MealPlanBuilder client={client} onClose={() => setShowBuilder(false)} />
      )}
    </div>
  );
};

export default AdminMealPlansPage;
