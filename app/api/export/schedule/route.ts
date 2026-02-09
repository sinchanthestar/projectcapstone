import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv'; // csv or json
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      whereClause += ' AND sa.scheduled_date >= $' + (params.length + 1);
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND sa.scheduled_date <= $' + (params.length + 1);
      params.push(endDate);
    }

    const result = await query(
      `SELECT 
        u.full_name as employee_name,
        u.email,
        e.department,
        e.position,
        s.name as shift_name,
        s.start_time,
        s.end_time,
        sa.scheduled_date,
        sa.is_confirmed,
        sa.notes
       FROM schedule_assignments sa
       JOIN employees e ON sa.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       JOIN shifts s ON sa.shift_id = s.id
       ${whereClause}
       ORDER BY sa.scheduled_date ASC, u.full_name ASC`,
      params
    );

    if (format === 'json') {
      return NextResponse.json({ schedules: result.rows });
    }

    // CSV format
    const csvHeaders = [
      'Employee Name',
      'Email',
      'Department',
      'Position',
      'Shift Name',
      'Start Time',
      'End Time',
      'Date',
      'Confirmed',
      'Notes',
    ];

    const csvRows = result.rows.map((row: any) => [
      row.employee_name,
      row.email,
      row.department || '',
      row.position || '',
      row.shift_name,
      row.start_time,
      row.end_time,
      row.scheduled_date,
      row.is_confirmed ? 'Yes' : 'No',
      row.notes || '',
    ]);

    const csv =
      csvHeaders.join(',') +
      '\n' +
      csvRows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="schedule-export.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
