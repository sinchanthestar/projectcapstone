import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT e.id, e.user_id, u.full_name, u.email, e.department, e.position, 
              e.phone, e.hire_date, e.is_available, e.created_at
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE u.is_active = true
       ORDER BY u.full_name ASC`
    );

    return NextResponse.json({ employees: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, department, position, phone, isAvailable } = await request.json();

    const result = await query(
      `UPDATE employees
       SET department = COALESCE($2, department),
           position = COALESCE($3, position),
           phone = COALESCE($4, phone),
           is_available = COALESCE($5, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, user_id, department, position, phone, hire_date, is_available`,
      [employeeId, department, position, phone, isAvailable]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
