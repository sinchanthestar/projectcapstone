import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get first employee
    const empRes = await query(`SELECT id, user_id FROM employees LIMIT 1`);
    if (!empRes.rows || empRes.rows.length === 0) {
      return NextResponse.json({ error: 'No employees found' }, { status: 400 });
    }

    const employeeId = empRes.rows[0].id;
    const today = new Date().toISOString().split('T')[0];

    // Create test attendance with PENDING status
    const res = await query(
      `INSERT INTO attendance_logs (employee_id, attendance_date, check_in_at, check_out_at, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id, attendance_date, status`,
      [
        employeeId,
        today,
        new Date(new Date().setHours(9, 0, 0)).toISOString(),
        null,
        'PENDING',
      ]
    );

    if (res.rows && res.rows.length > 0) {
      return NextResponse.json({ ok: true, created: res.rows[0] }, { status: 200 });
    } else {
      return NextResponse.json({ ok: true, message: 'Test data already exists' }, { status: 200 });
    }
  } catch (e) {
    console.error('test data error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
