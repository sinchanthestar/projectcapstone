import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { ScheduleBacktracker, greedySchedule } from '@/lib/scheduler';
import { notifyShiftAssigned } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, algorithm = 'backtrack' } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Generate date array
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      // Only weekdays (or configure based on business logic)
      const dayOfWeek = current.getDay();
      // Include if Monday-Friday (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
      return NextResponse.json(
        { error: 'No valid dates in range' },
        { status: 400 }
      );
    }

    // Fetch employees
    const employeeResult = await query(
      `SELECT id, user_id, is_available FROM employees WHERE is_available = true`,
      []
    );
    const employees = employeeResult.rows;

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'No available employees' },
        { status: 400 }
      );
    }

    // Fetch shifts
    const shiftResult = await query(
      `SELECT id, name, is_active FROM shifts WHERE is_active = true`,
      []
    );
    const shifts = shiftResult.rows;

    if (shifts.length === 0) {
      return NextResponse.json(
        { error: 'No active shifts' },
        { status: 400 }
      );
    }

    // Get existing assignments in date range
    const existingResult = await query(
      `SELECT employee_id, scheduled_date FROM schedule_assignments 
       WHERE scheduled_date >= $1 AND scheduled_date <= $2`,
      [startDate, endDate]
    );

    const existingAssignments = new Map<string, Set<string>>();
    for (const row of existingResult.rows) {
      const dateSet = existingAssignments.get(row.scheduled_date) || new Set<string>();
      dateSet.add(row.employee_id);
      existingAssignments.set(row.scheduled_date, dateSet);
    }

    // Generate schedule using selected algorithm
    let assignments: any[] = [];

    if (algorithm === 'backtrack') {
      const backtracker = new ScheduleBacktracker();
      assignments = await backtracker.generateSchedule(
        employees,
        shifts,
        dates,
        existingAssignments
      );
    } else {
      assignments = await greedySchedule(
        employees,
        shifts,
        dates,
        existingAssignments
      );
    }

    if (assignments.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate schedule' },
        { status: 400 }
      );
    }

    // Insert assignments into database
    const insertedAssignments: any[] = [];
    let successCount = 0;
    let conflictCount = 0;
    const insertedDates = new Set<string>();

    for (const assignment of assignments) {
      try {
        // Check if assignment already exists
        const existCheck = await query(
          `SELECT id FROM schedule_assignments 
           WHERE employee_id = $1 AND scheduled_date = $2`,
          [assignment.employeeId, assignment.scheduledDate]
        );

        if (existCheck.rows.length > 0) {
          conflictCount++;
          continue;
        }

        const result = await query(
          `INSERT INTO schedule_assignments (employee_id, shift_id, scheduled_date)
           VALUES ($1, $2, $3)
           RETURNING id, employee_id, shift_id, scheduled_date, is_confirmed`,
          [assignment.employeeId, assignment.shiftId, assignment.scheduledDate]
        );

        if (result.rows.length > 0) {
          insertedAssignments.push(result.rows[0]);
          successCount++;
          insertedDates.add(assignment.scheduledDate);

          // Get shift info for notification
          const shiftInfo = shifts.find((s) => s.id === assignment.shiftId);
          if (shiftInfo) {
            const empInfo = employees.find((e) => e.id === assignment.employeeId);
            if (empInfo) {
              // Send notification (async, don't block)
              notifyShiftAssigned(
                empInfo.user_id,
                shiftInfo.name,
                assignment.scheduledDate
              ).catch(console.error);
            }
          }
        }
      } catch (err) {
        conflictCount++;
        console.error('Error inserting assignment:', err);
      }
    }

    // Find first scheduled date for client to navigate to
    const sortedDates = Array.from(insertedDates).sort();
    const firstScheduledDate = sortedDates.length > 0 ? sortedDates[0] : startDate;

    return NextResponse.json({
      success: true,
      summary: {
        requested: assignments.length,
        inserted: successCount,
        conflicts: conflictCount,
        dateRange: { startDate, endDate },
        datesProcessed: dates.length,
        algorithm: algorithm,
        firstScheduledDate: firstScheduledDate,
      },
      assignments: insertedAssignments,
    });
  } catch (error) {
    console.error('Error auto-scheduling:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return scheduling status or recommendations
    const result = await query(
      `SELECT 
        COUNT(DISTINCT sa.id) as total_assignments,
        COUNT(DISTINCT sa.scheduled_date) as days_scheduled,
        COUNT(DISTINCT sa.employee_id) as employees_scheduled
       FROM schedule_assignments sa
       WHERE sa.created_at >= NOW() - INTERVAL '7 days'`,
      []
    );

    const stats = result.rows[0] || { total_assignments: 0, days_scheduled: 0, employees_scheduled: 0 };

    return NextResponse.json({
      recentScheduleStats: stats,
    });
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
