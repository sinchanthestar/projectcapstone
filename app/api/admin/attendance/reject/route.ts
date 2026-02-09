import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { attendanceId, notes } = await req.json();
    console.log('admin/attendance/reject - body:', { attendanceId, notes });
    console.log('admin/attendance/reject - session user:', session.user);
    if (!attendanceId) return NextResponse.json({ error: 'attendanceId required' }, { status: 400 });

    const queryParams = [notes || null, session.user.id, attendanceId];
    console.log('admin/attendance/reject - query params:', { notes: queryParams[0], approved_by: queryParams[1], attendanceId: queryParams[2] });
    await query(
      `UPDATE attendance_logs
       SET status='REJECTED',
           notes=$1,
           approved_by=$2,
           approved_at=CURRENT_TIMESTAMP,
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$3`,
      queryParams
    );
    console.log('admin/attendance/reject - update success');

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('reject error:', e);
    try {
      const body = await req.json().catch(() => null);
      console.error('reject details:', { body, error: e, env: process.env.NODE_ENV });
    } catch {}
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (e instanceof Error ? e.message : 'Internal server error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
