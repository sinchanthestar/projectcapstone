import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Pastikan role employee
    if (session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ambil employee_id dari user_id
    const empRes = await query(
      `SELECT id FROM employees WHERE user_id = $1`,
      [session.user.id]
    );
    if (empRes.rows.length === 0) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }
    const employeeId = empRes.rows[0].id;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // VALIDASI: Cek apakah ada jadwal untuk hari ini
    const scheduleCheck = await query(
      `SELECT id FROM schedule_assignments
       WHERE employee_id=$1 AND scheduled_date=$2
       LIMIT 1`,
      [employeeId, today]
    );

    if (scheduleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki jadwal kerja untuk hari ini. Hubungi manajer Anda.' },
        { status: 403 }
      );
    }

    const assignmentId = scheduleCheck.rows[0].id;

    // Cek sudah check-in hari ini belum
    const exist = await query(
      `SELECT id, status, check_in_at FROM attendance_logs
       WHERE employee_id=$1 AND attendance_date=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [employeeId, today]
    );

    if (exist.rows.length > 0 && exist.rows[0].check_in_at) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }

    const insert = await query(
      `INSERT INTO attendance_logs (employee_id, schedule_assignment_id, attendance_date, check_in_at, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'PENDING')
       RETURNING id`,
      [employeeId, assignmentId, today]
    );

    return NextResponse.json({ id: insert.rows[0].id, status: 'PENDING' }, { status: 201 });
  } catch (e) {
    console.error('check-in error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
