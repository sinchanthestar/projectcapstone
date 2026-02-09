import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') || 'PENDING').toUpperCase();
    const date = searchParams.get('date'); // optional YYYY-MM-DD

    const params: any[] = [status];
    let where = `a.status = $1`;

    if (date) {
      params.push(date);
      where += ` AND a.attendance_date = $2`;
    }

    const res = await query(
      `SELECT
        a.id,
        a.attendance_date,
        a.check_in_at,
        a.check_out_at,
        a.status,
        a.notes,
        e.id as employee_id,
        u.full_name,
        u.email
      FROM attendance_logs a
      JOIN employees e ON e.id = a.employee_id
      JOIN users u ON u.id = e.user_id
      WHERE ${where}
      ORDER BY a.created_at DESC`,
      params
    );

    return NextResponse.json({ logs: res.rows }, { status: 200 });
  } catch (e) {
    console.error('admin attendance list error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
