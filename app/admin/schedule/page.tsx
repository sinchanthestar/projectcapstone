import { AdminLayout } from '@/components/admin/admin-layout';
import { ScheduleManager } from '@/components/admin/schedule-manager';

export default function SchedulePage() {
  return (
    <AdminLayout>
      <ScheduleManager />
    </AdminLayout>
  );
}
