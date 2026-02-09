import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, startTime, endTime, description, color, isActive } = await request.json();

    const result = await query(
      `UPDATE shifts
       SET name = COALESCE($2, name),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           description = COALESCE($5, description),
           color = COALESCE($6, color),
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, start_time, end_time, description, color, is_active, updated_at`,
      [id, name, startTime, endTime, description, color, isActive]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ shift: result.rows[0] });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if shift is being used in active assignments
    const checkAssignments = await query(
      `SELECT COUNT(*) as count FROM schedule_assignments 
       WHERE shift_id = $1 AND scheduled_date >= CURRENT_DATE`,
      [id]
    );

    if (parseInt(checkAssignments.rows[0].count) > 0) {
      return NextResponse.json(
        { error: `Cannot delete shift. It has ${checkAssignments.rows[0].count} active assignments.` },
        { status: 400 }
      );
    }

    await query(
      'UPDATE shifts SET is_active = false WHERE id = $1',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
