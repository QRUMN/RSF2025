import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { Eye } from 'lucide-react';
import MealPlanModal from './MealPlanModal';
import UserNameWithPhoto from '../ui/UserNameWithPhoto';

const ClientStatusWidget: React.FC = () => {
  const { clients, loading, error } = useClients();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClientName, setModalClientName] = useState('');
  const [modalProfilePhotoUrl, setModalProfilePhotoUrl] = useState<string | undefined>();

  // Placeholder: In a real app, status would come from profile or booking activity
  // For now, randomly assign 'Active' or 'Inactive' for demo
  const getStatus = (id: string) => (parseInt(id.replace(/\D/g, ''), 10) % 2 === 0 ? 'Active' : 'Inactive');

  const handleViewMealPlan = (clientName: string, profilePhotoUrl?: string) => {
    setModalClientName(clientName);
    setModalProfilePhotoUrl(profilePhotoUrl);
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-dark border border-primary/10 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Client Status Overview</h3>
        {loading && <div className="text-light/50">Loading clients...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && clients.length === 0 && (
          <div className="text-light/50">No clients found.</div>
        )}
        {!loading && !error && clients.length > 0 && (
          <ul className="divide-y divide-primary/10">
            {clients.slice(0, 5).map(client => (
              <li key={client.id} className="flex justify-between items-center py-2">
                <UserNameWithPhoto name={client.name} photoUrl={client.profile_photo_url} size={24} />
                <span className={`ml-4 px-2 py-1 rounded text-xs font-bold flex items-center gap-2 ${getStatus(client.id) === 'Active' ? 'bg-green-800/30 text-green-400' : 'bg-red-800/30 text-red-400'}`}>
                  {getStatus(client.id)}
                  {getStatus(client.id) === 'Active' && (
                    <button
                      title={`View ${client.name}'s meal plan`}
                      className="ml-1 hover:text-cyan-300 focus:outline-none"
                      onClick={() => handleViewMealPlan(client.name, client.profile_photo_url)}
                    >
                      <Eye className="inline w-4 h-4" />
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <MealPlanModal open={modalOpen} onClose={() => setModalOpen(false)} clientName={modalClientName} profilePhotoUrl={modalProfilePhotoUrl} />
    </>
  );
};

export default ClientStatusWidget;
