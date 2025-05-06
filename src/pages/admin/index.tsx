// Simple index file to route /admin to the dashboard, but also expose links to new features
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminIndex = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);
  return null;
};

export default AdminIndex;
