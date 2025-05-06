import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (data) {
          setClients(
            data.map((u: any) => ({
              id: u.id,
              name: [u.first_name, u.last_name].filter(Boolean).join(' '),
              email: u.email,
              phone: u.phone,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  return { clients, loading, error };
}
