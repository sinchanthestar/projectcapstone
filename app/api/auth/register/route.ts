import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie, getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json();

    // ✅ cek apakah admin sudah ada
    const adminCheck = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminAlreadyExists = adminCheck.rows.length > 0;

    // ✅ jika admin sudah ada → hanya admin yang boleh create user
    const session = await getSession();
    if (adminAlreadyExists) {
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Normalize role
    const normalizedRole = (role || 'employee').toLowerCase();

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, is_active`,
      [email, passwordHash, fullName, normalizedRole, true]
    );

    const user = userResult.rows[0];

    // If employee role, create employee record
    if (normalizedRole === 'employee') {
      await query('INSERT INTO employees (user_id) VALUES ($1)', [user.id]);
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
    };

    // ✅ Jika admin yang membuat user → jangan ganti sesi admin
    const isAdminCreatingUser = !!session && session.user.role === 'admin';
    if (isAdminCreatingUser) {
      return NextResponse.json({ user: userData }, { status: 201 });
    }

    // Jika bukan admin (misal kasus setup awal), set cookie
    const token = await generateToken(userData);
    await setAuthCookie(token);

    return NextResponse.json({ user: userData, token }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
