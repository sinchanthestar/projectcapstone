import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.user.role !== 'employee') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const empRes = await query(`SELECT id FROM employees WHERE user_id = $1`, [session.user.id]);
    if (empRes.rows.length === 0) return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    const employeeId = empRes.rows[0].id;

    const today = new Date().toISOString().slice(0, 10);

    // Cari log hari ini terbaru yang sudah check-in
    const logRes = await query(
      `SELECT id, check_in_at, check_out_at FROM attendance_logs
       WHERE employee_id=$1 AND attendance_date=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [employeeId, today]
    );

    if (logRes.rows.length === 0 || !logRes.rows[0].check_in_at) {
      return NextResponse.json({ error: 'No check-in found for today' }, { status: 400 });
    }
    if (logRes.rows[0].check_out_at) {
      return NextResponse.json({ error: 'Already checked out today' }, { status: 400 });
    }

    await query(
      `UPDATE attendance_logs
       SET check_out_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP, status='PENDING'
       WHERE id=$1`,
      [logRes.rows[0].id]
    );

    return NextResponse.json({ ok: true, status: 'PENDING' }, { status: 200 });
  } catch (e) {
    console.error('check-out error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
