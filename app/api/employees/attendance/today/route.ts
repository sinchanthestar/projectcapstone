import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'employee') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const empRes = await query(`SELECT id FROM employees WHERE user_id = $1`, [session.user.id]);
    if (empRes.rows.length === 0) return NextResponse.json({ attendance: null }, { status: 200 });
    const employeeId = empRes.rows[0].id;

    const today = new Date().toISOString().slice(0, 10);

    const logRes = await query(
      `SELECT id, attendance_date, check_in_at, check_out_at, status, notes
       FROM attendance_logs
       WHERE employee_id=$1 AND attendance_date=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [employeeId, today]
    );

    if (logRes.rows.length === 0) {
      return NextResponse.json({ attendance: { status: 'NONE' } }, { status: 200 });
    }

    return NextResponse.json({ attendance: logRes.rows[0] }, { status: 200 });
  } catch (e) {
    console.error('today attendance error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
