import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Delete all assignments in date range
    const result = await query(
      `DELETE FROM schedule_assignments 
       WHERE scheduled_date >= $1 AND scheduled_date <= $2
       RETURNING id`,
      [startDate, endDate]
    );

    const deletedCount = result.rows.length;

    return NextResponse.json({ 
      success: true,
      deleted: deletedCount,
      message: `${deletedCount} jadwal telah dihapus`
    });
  } catch (error) {
    console.error('Error clearing schedule range:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
