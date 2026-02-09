import { AdminLayout } from '@/components/admin/admin-layout';
import { ShiftsManager } from '@/components/admin/shifts-manager';

export default function ShiftsPage() {
  return (
    <AdminLayout>
      <ShiftsManager />
    </AdminLayout>
  );
}
