import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';

    let whereClause = 'WHERE user_id = $1';
    const params: any[] = [session.user.id];

    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    const result = await query(
      `SELECT id, type, title, message, is_read, created_at
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 50`,
      params
    );

    return NextResponse.json({ notifications: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
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

    const { userId, type, title, message } = await request.json();

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, type, title, message, is_read, created_at`,
      [userId, type, title, message || null]
    );

    return NextResponse.json(
      { notification: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
