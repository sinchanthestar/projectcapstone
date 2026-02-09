import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, name, start_time, end_time, description, color, is_active, created_at
       FROM shifts
       WHERE is_active = true
       ORDER BY start_time ASC`
    );

    return NextResponse.json({ shifts: result.rows });
  } catch (error) {
    console.error('Error fetching shifts:', error);
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

    const { name, startTime, endTime, description, color } = await request.json();

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO shifts (name, start_time, end_time, description, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, start_time, end_time, description, color, is_active, created_at`,
      [name, startTime, endTime, description || null, color || '#3b82f6']
    );

    return NextResponse.json(
      { shift: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
