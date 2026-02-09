import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'present';
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    let result;

    if (category === 'present') {
      // Karyawan yang sudah hadir (check-in approved)
      result = await query(
        `SELECT DISTINCT e.id, u.full_name, e.department, e.position
         FROM employees e
         JOIN users u ON e.user_id = u.id
         JOIN attendance_logs al ON e.id = al.employee_id
         WHERE al.attendance_date = $1 AND al.status = 'APPROVED'
         ORDER BY u.full_name ASC`,
        [date]
      );
    } else if (category === 'alfa') {
      // Karyawan alfa (dijadwalkan tapi tidak hadir dan tidak ada izin)
      result = await query(
        `SELECT DISTINCT e.id, u.full_name, e.department, e.position
         FROM employees e
         JOIN users u ON e.user_id = u.id
         JOIN schedule_assignments sa ON e.id = sa.employee_id
         WHERE sa.scheduled_date = $1
         AND e.id NOT IN (
           SELECT DISTINCT employee_id FROM attendance_logs 
           WHERE attendance_date = $1 AND status = 'APPROVED'
         )
         AND e.id NOT IN (
           SELECT DISTINCT employee_id FROM leave_requests 
           WHERE status='APPROVED' AND $1 BETWEEN date_from AND date_to
         )
         ORDER BY u.full_name ASC`,
        [date]
      );
    } else if (category === 'leave') {
      // Karyawan dengan izin resmi
      result = await query(
        `SELECT DISTINCT e.id, u.full_name, e.department, e.position
         FROM employees e
         JOIN users u ON e.user_id = u.id
         JOIN leave_requests lr ON e.id = lr.employee_id
         WHERE lr.status='APPROVED' AND $1 BETWEEN lr.date_from AND lr.date_to
         ORDER BY u.full_name ASC`,
        [date]
      );
    }

    return NextResponse.json({ employees: result?.rows || [] }, { status: 200 });
  } catch (e) {
    console.error('attendance list error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
