# Shift Manager - Quick Start Guide

Get your shift scheduling system up and running in 5 minutes.

## Prerequisites Check

Before starting, verify you have:
- ✓ Node.js 18+ installed (`node --version`)
- ✓ PostgreSQL running (`psql --version`)
- ✓ A text editor or IDE

## 5-Minute Setup

### 1. Clone and Install (1 min)
```bash
npm install
```

### 2. Configure Database (1 min)

Create `.env.local` in your project root:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
JWT_SECRET=your-super-secret-key-12345
NODE_ENV=development
```

**Need a database?**
```bash
# Create one in PostgreSQL
psql -U postgres -c "CREATE DATABASE shift_manager;"
```

### 3. Start Application (1 min)
```bash
npm run dev
```

### 4. Automatic Setup (1 min)
- Open http://localhost:3000
- You'll be automatically redirected to the setup wizard
- Click "Initialize Database" - tables will be created automatically
- Wait for completion (30 seconds)

### 5. Create Admin Account (1 min)
- Click "Create Admin Account" button
- Register your first admin user:
  - Email: `admin@yourcompany.com`
  - Password: `password123` (or your choice, min 8 chars)
  - Full Name: Your Name
- Click "Create Account"
- You're automatically logged in to the admin dashboard!

## Success! 🎉

You now have access to:
- **Admin Dashboard**: `/admin`
- **Employee View**: `/employee`
- **Shift Management**: `/admin/shifts`
- **Schedule Management**: `/admin/schedule`
- **Employee Management**: `/admin/employees`

## What's Next?

### Step 1: Create Your First Shift
1. Go to Admin > Shifts
2. Click "New Shift"
3. Fill in:
   - Name: "Morning Shift"
   - Start Time: 08:00
   - End Time: 16:00
   - Color: Blue
4. Click "Create Shift"

### Step 2: Add Employees
1. Go to Admin > Employees
2. Click "Add Employee"
3. Register employee accounts
4. Assign them to departments

### Step 3: Create Your First Schedule
1. Go to Admin > Schedule
2. Click "Assign Shift"
3. Select an employee
4. Choose a shift
5. Pick a date
6. Click "Assign Shift"
7. Employee gets instant notification!

### Step 4: Export Schedule
1. Go to Admin > Schedule
2. Click "Export Schedule"
3. Choose CSV or JSON format
4. Download your schedule

## Role Breakdown

### Admin
- Create and manage all shifts
- Manage all employees
- Create schedules
- Export reports
- System administration

### Manager
- Create shifts
- Manage team schedules
- View reports
- Assign shifts to team

### Employee
- View their schedule
- See upcoming shifts
- Receive notifications
- Track shifts

## Common Tasks

### Change User Role to Manager
```sql
UPDATE users SET role = 'manager' WHERE email = 'user@example.com';
```

### View All Assignments for Today
Visit `/admin/schedule` and check the calendar for today's date.

### Reset Admin Password
```sql
-- First, generate a new hash in Node.js
-- const hash = await hashPassword('newpassword123');
-- Then run:
UPDATE users SET password_hash = 'salt:hash' WHERE role = 'admin';
```

### Export Full Database
```bash
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
psql postgresql://localhost/shift_manager

# If connection fails, check credentials in .env.local
```

### "Tables already exist"
```bash
# If you get errors, drop and recreate:
psql -U postgres -c "DROP DATABASE shift_manager;"
psql -U postgres -c "CREATE DATABASE shift_manager;"
# Then restart the app and re-run setup
```

### "JWT_SECRET not set"
```
Make sure .env.local has:
JWT_SECRET=your-secret-key
(Restart dev server after updating .env.local)
```

### Admin account won't create
- Clear browser cookies
- Try registering again
- Check browser console (F12) for errors

## File Structure

```
shift-manager/
├── app/
│   ├── page.tsx           # Home page
│   ├── setup/             # Setup wizard
│   ├── login/             # Login page
│   ├── register/          # Registration
│   ├── admin/             # Admin dashboard
│   ├── employee/          # Employee dashboard
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin UI components
│   ├── employee/          # Employee UI components
│   ├── setup/             # Setup wizard UI
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── setup.ts           # Setup utilities
│   ├── auth.ts            # Authentication
│   └── db.ts              # Database connection
├── scripts/
│   └── 01-init-database.sql # Manual schema
├── .env.example           # Environment template
├── SETUP_GUIDE.md         # Detailed setup guide
├── SYSTEM_DOCUMENTATION.md # Architecture docs
└── README.md              # Full documentation
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/shift_manager` |
| `JWT_SECRET` | Authentication secret | `your-super-secret-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `NEXT_PUBLIC_API_URL` | Client API endpoint | `http://localhost:3000` |

## Health Check

Check if everything is running:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "initialized": true
  }
}
```

## Performance Tips

- Use the setup wizard for first-time setup (1 click!)
- Export schedules regularly for backups
- Keep browser cache cleared while testing
- Use incognito mode if having authentication issues

## Security Reminders

- Change `JWT_SECRET` to a strong random value in production
- Never commit `.env.local` to version control
- Use strong passwords (8+ characters, mix of cases, numbers)
- Enable HTTPS in production
- Regularly backup your database
- Keep dependencies updated

## Next Resources

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[System Documentation](./SYSTEM_DOCUMENTATION.md)** - Architecture & API
- **[README](./README.md)** - Full feature documentation
- **[API Reference](#api-endpoints)** - All available endpoints

## Getting Help

### Check the Application
1. **Setup Status**: Visit http://localhost:3000/api/setup/status
2. **System Health**: Visit http://localhost:3000/api/health
3. **Browser Console**: Press F12 to see errors
4. **Terminal Logs**: Check npm run dev output

### Review Logs
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT now();"

# Check environment variables
echo $DATABASE_URL
echo $JWT_SECRET
```

### Common Solutions
- Restart dev server (`Ctrl+C`, then `npm run dev`)
- Clear browser cache (Ctrl+Shift+Delete)
- Check `.env.local` for typos
- Verify PostgreSQL is running

## API Endpoints Quick Reference

```
Auth:
  POST   /api/auth/register     - Create account
  POST   /api/auth/login        - Sign in
  GET    /api/auth/session      - Current user
  POST   /api/auth/logout       - Sign out

Setup:
  GET    /api/setup/status      - Check setup status
  POST   /api/setup/init        - Initialize database

Shifts:
  GET    /api/shifts            - List shifts
  POST   /api/shifts            - Create shift
  PUT    /api/shifts/[id]       - Update shift
  DELETE /api/shifts/[id]       - Delete shift

Employees:
  GET    /api/employees         - List employees
  PUT    /api/employees         - Update employee

Assignments:
  GET    /api/assignments       - List assignments
  POST   /api/assignments       - Create assignment
  PUT    /api/assignments/[id]  - Update assignment
  DELETE /api/assignments/[id]  - Delete assignment

Notifications:
  GET    /api/notifications     - Get notifications
  PUT    /api/notifications/[id] - Mark as read

Export:
  GET    /api/export/schedule   - Export schedule

Health:
  GET    /api/health            - System status
```

## Production Deployment

When ready to deploy:

1. **Build**: `npm run build`
2. **Test**: `npm start` (test production build locally)
3. **Deploy**: Use your hosting provider (Vercel, Railway, Render, etc.)
4. **Update `.env`**: Set production DATABASE_URL and JWT_SECRET
5. **Monitor**: Check `/api/health` endpoint

## Support

For detailed information, see:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Comprehensive setup instructions
- [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) - Full architecture docs
- [README.md](./README.md) - Feature documentation

---

**Ready to get started? Run `npm run dev` now!** 🚀
