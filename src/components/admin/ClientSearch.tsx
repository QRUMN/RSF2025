import React, { useState } from 'react';

import { useClients } from '../../hooks/useClients';
import UserNameWithPhoto from '../ui/UserNameWithPhoto';

interface ClientSearchProps {
  onSelect: (client: { id: string; name: string } | null) => void;
  selectedClient?: { id: string; name: string } | null;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onSelect, selectedClient }) => {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<{ id: string; name: string }[]>([]);
  const { clients, loading, error } = useClients();
  const filtered = clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  // Select client and update recent
  const handleSelect = (client: { id: string; name: string }) => {
    onSelect(client);
    setRecent(prev => {
      const filteredPrev = prev.filter(c => c.id !== client.id);
      return [client, ...filteredPrev].slice(0, 3);
    });
  };

  // Clear selection
  const handleClear = () => onSelect(null);

  return (
    <div className="mb-6">
      <label className="block mb-1 text-light/80 font-medium">Search Client:</label>
      {recent.length > 0 && (
        <div className="flex gap-2 mb-2">
          {recent.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="px-3 py-1 rounded bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/40 transition flex items-center gap-2"
            >
              <UserNameWithPhoto name={c.name} photoUrl={clients.find(cl => cl.id === c.id)?.profile_photo_url} size={20} />
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type client name..."
        className="w-full px-4 py-2 rounded-md bg-dark border border-primary/30 text-light focus:ring-2 focus:ring-primary outline-none transition mb-2"
      />
      {query.trim().length > 0 && (
        <div className="bg-dark border border-primary/10 rounded-md shadow max-h-40 overflow-y-auto">
          {loading && <div className="px-4 py-2 text-light/50">Loading clients...</div>}
          {error && <div className="px-4 py-2 text-red-400">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="px-4 py-2 text-light/50">No clients found.</div>
          )}
          {!loading && !error && filtered.map(client => (
            <button
              key={client.id}
              onClick={() => handleSelect(client)}
              className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition flex items-center gap-2 ${selectedClient?.id === client.id ? 'bg-primary/20 text-primary font-semibold' : 'text-light'}`}
            >
              <UserNameWithPhoto name={client.name} photoUrl={client.profile_photo_url} size={20} />
            </button>
          ))}
        </div>
      )}
      {selectedClient && (
        <div className="flex items-center gap-2 mb-2">
          <UserNameWithPhoto name={selectedClient.name} photoUrl={clients.find(cl => cl.id === selectedClient.id)?.profile_photo_url} size={24} />
          <button
            className="px-3 py-1 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
            onClick={() => onSelect(null)}
          >
            Clear Selection
          </button>
        </div>
      )}

    </div>
  );
};

export default ClientSearch;
