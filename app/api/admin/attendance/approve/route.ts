import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { attendanceId } = await req.json();
    console.log('admin/attendance/approve - body:', { attendanceId });
    console.log('admin/attendance/approve - session user:', session.user);
    if (!attendanceId) return NextResponse.json({ error: 'attendanceId required' }, { status: 400 });

    const queryParams = [session.user.id, attendanceId];
    console.log('admin/attendance/approve - query params:', { approved_by: queryParams[0], attendanceId: queryParams[1] });
    await query(
      `UPDATE attendance_logs
       SET status='APPROVED',
           approved_by=$1,
           approved_at=CURRENT_TIMESTAMP,
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$2`,
      queryParams
    );
    console.log('admin/attendance/approve - update success');

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('approve error:', e);
    try {
      // additional context for debugging
      const body = await req.json().catch(() => null);
      console.error('approve details:', { body, error: e, env: process.env.NODE_ENV });
    } catch {}
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (e instanceof Error ? e.message : 'Internal server error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
