import AdminDashboard from '@/components/AdminDashboard';
import { AuthGuard } from '@/components/AuthGuard';

export default function Home() {
  return (
      <AuthGuard>
          <AdminDashboard />
      </AuthGuard>
  );
}
