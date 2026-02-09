import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { notifyShiftAssigned } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (date) {
      whereClause += ' AND sa.scheduled_date = $' + (params.length + 1);
      params.push(date);
    }

    // Support date range filter
    if (startDate) {
      whereClause += ' AND sa.scheduled_date >= $' + (params.length + 1);
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND sa.scheduled_date <= $' + (params.length + 1);
      params.push(endDate);
    }

    if (employeeId) {
      whereClause += ' AND sa.employee_id = $' + (params.length + 1);
      params.push(employeeId);
    }

    const result = await query(
      `SELECT sa.id, sa.employee_id, sa.shift_id, sa.scheduled_date, 
              sa.is_confirmed, sa.notes, sa.created_at,
              u.full_name, s.name as shift_name, s.start_time, s.end_time, s.color
       FROM schedule_assignments sa
       JOIN employees e ON sa.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       JOIN shifts s ON sa.shift_id = s.id
       ${whereClause}
       ORDER BY sa.scheduled_date ASC, s.start_time ASC`,
      params
    );

    return NextResponse.json({ assignments: result.rows });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, shiftId, scheduledDate, notes } = await request.json();

    if (!employeeId || !shiftId || !scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictResult = await query(
      `SELECT COUNT(*) as count FROM schedule_assignments
       WHERE employee_id = $1 AND scheduled_date = $2`,
      [employeeId, scheduledDate]
    );

    if (conflictResult.rows[0].count > 0) {
      return NextResponse.json(
        { error: 'Employee already has a shift assigned for this date' },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO schedule_assignments (employee_id, shift_id, scheduled_date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, employee_id, shift_id, scheduled_date, is_confirmed, notes, created_at`,
      [employeeId, shiftId, scheduledDate, notes || null]
    );

    // Get shift and employee info for notification
    const shiftResult = await query('SELECT name FROM shifts WHERE id = $1', [shiftId]);
    const employeeResult = await query('SELECT user_id FROM employees WHERE id = $1', [employeeId]);

    if (shiftResult.rows[0] && employeeResult.rows[0]) {
      await notifyShiftAssigned(
        employeeResult.rows[0].user_id,
        shiftResult.rows[0].name,
        scheduledDate
      );
    }

    return NextResponse.json(
      { assignment: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
