import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password baru minimal 8 karakter' }, { status: 400 });
    }

    // Ambil password_hash lama user
    const userRes = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [session.user.id]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes.rows[0];

    // Cek password lama
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
    }

    // Hash password baru
    const newHash = await hashPassword(newPassword);

    // Update password_hash
    await query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newHash, session.user.id]
    );

    return NextResponse.json({ message: 'Password updated' }, { status: 200 });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
