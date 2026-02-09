# 🚀 Shift Manager - Start Here

Welcome to the **Shift Manager** - a comprehensive employee shift scheduling system with **automated database setup**.

## What Is This System?

A production-ready web application that helps managers:
- ✅ Create and manage shifts
- ✅ Assign employees to shifts
- ✅ Detect scheduling conflicts automatically
- ✅ Send real-time notifications
- ✅ Export schedules
- ✅ Control access with roles (Admin, Manager, Employee)

## ⚡ Get Running in 5 Minutes

### Step 1: Copy Environment Template
```bash
cp .env.example .env.local
```

### Step 2: Update DATABASE_URL
Edit `.env.local` and set your PostgreSQL connection:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Step 3: Start the Application
```bash
npm install
npm run dev
```

### Step 4: Complete Setup
- Open http://localhost:3000
- The system automatically redirects to `/setup`
- Click "Initialize Database" (creates all tables automatically)
- Register your first admin account
- You're done! 🎉

**That's it!** No manual SQL scripts needed. The setup wizard handles everything.

## 📚 Documentation Map

Depending on what you need, here's where to go:

### 🎯 Choose Your Path

#### "I just want to use it" (Employee/Manager)
1. Ask admin for login credentials
2. Visit http://localhost:3000
3. Log in and view your schedule

#### "I need to set it up" (System Administrator)
1. Follow steps above (5 minutes)
2. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details
3. Configure database backups

#### "I need to understand it" (Developer)
1. Follow steps above
2. Read [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)
3. Explore `/app/api` for endpoints
4. Check `/lib` for utilities

#### "Give me everything" (Project Manager)
1. Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) (5 min overview)
2. Check feature list in [README.md](./README.md)
3. Review deployment section

## 📖 All Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 5-min setup + common tasks | 5 min |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Detailed setup + troubleshooting | 20 min |
| **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)** | Complete architecture + API | 30 min |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Features + statistics overview | 15 min |
| **[README.md](./README.md)** | General reference | 10 min |
| **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** | How to find information | 10 min |

## ✨ Key Features

### For Admins
- 🛠️ **Setup Wizard**: One-click database initialization
- 📅 **Shift Management**: Create and edit shifts
- 👥 **Employee Management**: Manage team members
- 📊 **Schedule Management**: Assign shifts with conflict detection
- 📤 **Export**: Download schedules as CSV/JSON

### For Managers
- 🎯 **Shift Creation**: Define team shifts
- 📅 **Team Scheduling**: Manage your team's schedule
- 🔔 **Notifications**: Keep team informed
- 📊 **Reports**: Export team schedules

### For Employees
- 📅 **My Schedule**: View personal shifts
- 🔔 **Notifications**: Get shift alerts
- ⏰ **Shift Details**: See timing and details
- 📊 **History**: Track past shifts

## 🔒 Security

- ✅ Secure password hashing (PBKDF2)
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ SQL injection prevention
- ✅ Role-based access control
- ✅ Automatic conflict detection

## 🏗️ Technology

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: PostgreSQL with connection pooling
- **API**: RESTful Next.js API routes
- **Auth**: JWT with HTTP-only cookies
- **UI**: shadcn/ui + TailwindCSS
- **Styling**: Modern, responsive design

## 📊 System Requirements

### Minimum
- Node.js 18+
- PostgreSQL 12+
- 2GB RAM
- 100MB disk space

### Recommended
- Node.js 20+
- PostgreSQL 14+
- 4GB RAM
- 500MB disk space

## 🚀 Common First Steps

After setup, here's what to do:

### 1. Create Your First Shift
```
1. Go to Admin > Shifts
2. Click "New Shift"
3. Fill in details (e.g., "Morning Shift", 8am-4pm)
4. Click "Create Shift"
```

### 2. Add an Employee
```
1. Go to Admin > Employees
2. Click "Add Employee"
3. Register their account
4. Assign to department
```

### 3. Create a Schedule
```
1. Go to Admin > Schedule
2. Click "Assign Shift"
3. Select employee + shift + date
4. Click "Assign Shift"
5. Employee gets notification!
```

### 4. Export Schedule
```
1. Go to Admin > Schedule
2. Click "Export Schedule"
3. Choose CSV or JSON
4. Download file
```

## 🎮 Demo Users

After setup, create test accounts:

```
Admin Account (created during setup)
Email: admin@example.com
Role: Admin
Access: Full system

Manager Account (register as)
Email: manager@example.com
Role: Manager (change in database)
Access: Shift + team management

Employee Account (register as)
Email: employee@example.com
Role: Employee
Access: View personal schedule
```

## 🛠️ Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/shift_manager
JWT_SECRET=your-secure-random-key
NODE_ENV=development
```

### Optional
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
LOG_LEVEL=info
DEBUG=false
```

## 🔍 Check System Health

Open this URL in your browser:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "initialized": true
  }
}
```

## ⚠️ If Something Goes Wrong

### Setup wizard not loading?
1. Check browser console (F12)
2. Verify DATABASE_URL in `.env.local`
3. Restart dev server
4. Try hard refresh (Ctrl+Shift+R)

### Can't log in?
1. Clear browser cookies
2. Try registering new account
3. Check email/password match

### Database connection failed?
1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Test connection: `psql $DATABASE_URL`

### Still stuck?
→ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) "Troubleshooting" section

## 📞 Quick Reference

### URLs
- **Home**: http://localhost:3000
- **Setup Wizard**: http://localhost:3000/setup
- **Admin Dashboard**: http://localhost:3000/admin
- **Employee Dashboard**: http://localhost:3000/employee
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Health Check**: http://localhost:3000/api/health

### Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check database
psql $DATABASE_URL
```

### Files to Know
- **`.env.local`** - Your configuration (created from `.env.example`)
- **`/app/page.tsx`** - Home page
- **`/app/setup`** - Setup wizard
- **`/app/api`** - API endpoints
- **`/lib/setup.ts`** - Database initialization
- **`/lib/auth.ts`** - Authentication
- **`/lib/db.ts`** - Database connection

## 🎓 Learning Resources

### For Managers
- [Feature Overview](./README.md#powerful-features)
- [Role Breakdown](./QUICKSTART.md#role-breakdown)
- [Common Tasks](./QUICKSTART.md#common-tasks)

### For Developers
- [API Reference](./README.md#api-endpoints)
- [Database Schema](./SYSTEM_DOCUMENTATION.md#database-schema)
- [Architecture](./SYSTEM_DOCUMENTATION.md#architecture)

### For System Admins
- [Setup Process](./SETUP_GUIDE.md#automatic-setup-wizard)
- [Database Details](./SYSTEM_DOCUMENTATION.md#database-details)
- [Production Deployment](./SYSTEM_DOCUMENTATION.md#deployment-steps)

## ✅ Deployment Checklist

When deploying to production:

- [ ] Read [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) deployment section
- [ ] Generate strong JWT_SECRET
- [ ] Configure database backups
- [ ] Set up HTTPS/SSL
- [ ] Update environment variables
- [ ] Configure database for production
- [ ] Set up monitoring and logging
- [ ] Test all features
- [ ] Plan team rollout

## 📈 Next Steps

### Day 1 (Setup)
✅ Run setup wizard
✅ Create admin account
✅ Create first shift

### Day 2 (Basics)
✅ Add employees
✅ Create schedule
✅ Send notifications

### Day 3 (Advanced)
✅ Export schedules
✅ Manage multiple shifts
✅ Review reports

### Week 2+
✅ Full team onboarding
✅ Optimize schedules
✅ Plan scaling

## 🎯 Success Metrics

You'll know the system is working when:
- ✅ Setup wizard completes in < 1 minute
- ✅ Admin dashboard loads in < 2 seconds
- ✅ Employees receive shift notifications
- ✅ Export works for schedules
- ✅ Conflict detection prevents duplicates

## 🌟 Pro Tips

1. **Use the setup wizard** - It's faster than manual SQL
2. **Export regularly** - Keep backups of schedules
3. **Test with test accounts** - Before rolling out to team
4. **Monitor `/api/health`** - Check system status anytime
5. **Review logs** - Check terminal for errors

## 📱 Mobile Support

- ✅ Responsive design
- ✅ Touch-friendly controls
- ✅ Works on all devices
- ✅ No app installation needed

## 🔐 Security Reminders

- Change default passwords
- Use strong JWT_SECRET
- Enable HTTPS in production
- Regular database backups
- Keep dependencies updated
- Review access logs regularly

## 🎉 You're All Set!

1. Your system is installed
2. Database is initialized
3. Admin account is created
4. You're ready to use it!

### What to do now:
1. **Create a shift** (Admin > Shifts)
2. **Add an employee** (Admin > Employees)
3. **Assign a shift** (Admin > Schedule)
4. **Check notifications** (See the bell icon)

---

## 📚 Full Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed guide
- **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)** - Technical details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete overview
- **[README.md](./README.md)** - Feature documentation
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Find anything

---

## 💡 Need Help?

| Question | Answer |
|----------|--------|
| How do I set up? | See [QUICKSTART.md](./QUICKSTART.md) |
| Why can't I log in? | Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting |
| How do I deploy? | See [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) |
| What are the APIs? | Check [README.md](./README.md) |
| How do I find info? | Use [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) |

---

**Ready? Run `npm run dev` and visit http://localhost:3000!** 🚀

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Last Updated**: January 29, 2024
