# Shift Manager - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Automatic Setup Wizard](#automatic-setup-wizard)
4. [Troubleshooting](#troubleshooting)
5. [Database Details](#database-details)

## Prerequisites

Before starting the setup, ensure you have:

### Required Software
- **Node.js**: Version 18 or higher
- **npm** or **yarn**: For package management
- **PostgreSQL**: Version 12 or higher running and accessible

### Database Preparation
1. PostgreSQL server must be running
2. Create a new database for the application:
   ```sql
   CREATE DATABASE shift_manager;
   ```
3. Note your connection credentials:
   - Host (usually `localhost`)
   - Port (usually `5432`)
   - Username
   - Password
   - Database name

## Environment Configuration

### Step 1: Create `.env.local` File
In the root of your project directory, create a `.env.local` file with the following variables:

```env
# Database Connection String
DATABASE_URL=postgresql://username:password@localhost:5432/shift_manager

# JWT Secret for authentication (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment (development/production)
NODE_ENV=development

# Optional: API URL for client-side requests
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 2: Security Best Practices
- **JWT_SECRET**: Generate a secure random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **DATABASE_URL**: Use strong passwords, never commit to version control
- **NODE_ENV**: Set to `production` when deploying

## Automatic Setup Wizard

### Starting the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Setup Wizard**:
   - Open your browser to `http://localhost:3000`
   - System automatically redirects to `http://localhost:3000/setup`

### Setup Wizard Workflow

#### Stage 1: Database Check
The wizard checks:
- ✓ DATABASE_URL is configured
- ✓ PostgreSQL connection is valid
- ✓ Database is accessible

**Possible Issues:**
- "DATABASE_URL not configured" → Add DATABASE_URL to `.env.local`
- "Cannot connect to database" → Verify PostgreSQL is running and credentials are correct

#### Stage 2: Schema Initialization
When you click "Initialize Database":
- Creates all necessary tables
- Sets up indexes for performance
- Configures foreign key relationships

**Tables Created:**
- `users` - Authentication and user profiles
- `employees` - Employee details
- `shifts` - Shift definitions
- `schedule_assignments` - Shift assignments
- `notifications` - User notifications
- `sessions` - Authentication sessions

#### Stage 3: Admin Account Creation
After database initialization:
- Click "Create Admin Account"
- Redirects to registration page
- Create your first admin user
- Email: Any valid email address
- Password: Minimum 8 characters

### First Admin Account

Your first account should have:
- **Email**: A valid email address (e.g., `admin@company.com`)
- **Full Name**: Your name (e.g., `Admin User`)
- **Password**: Strong, at least 8 characters
- **Role**: Automatically set to "admin"

After registration:
1. You'll be logged in automatically
2. Redirects to admin dashboard
3. You can now manage shifts and employees

## Troubleshooting

### Database Connection Issues

**Error: "Cannot connect to database"**

Solutions:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   
   # Windows
   sc query postgresql
   ```

2. Verify connection string format:
   ```
   postgresql://username:password@host:port/database_name
   ```

3. Test connection manually:
   ```bash
   psql postgresql://username:password@localhost:5432/shift_manager
   ```

4. Check credentials:
   - Username is correct
   - Password is correct (no special characters that need escaping)
   - Database exists

**Error: "DATABASE_URL not configured"**

Solutions:
1. Verify `.env.local` file exists in project root
2. Ensure format is exactly: `DATABASE_URL=postgresql://...`
3. No spaces around the `=` sign
4. Restart development server after adding variables

### Schema Initialization Issues

**Error: "Tables were not created successfully"**

Solutions:
1. Check database user has CREATE permissions
2. Verify database is empty (no existing tables)
3. Check logs for SQL errors
4. Try manual setup: `psql -U user -d shift_manager -f scripts/01-init-database.sql`

### Authentication Issues

**Cannot log in after setup**

Solutions:
1. Clear browser cookies
2. Verify admin account was created
3. Check password is correct (case-sensitive)
4. Verify JWT_SECRET hasn't changed since account creation

**"Invalid credentials" error**

Solutions:
1. Verify email address exactly (case-sensitive)
2. Password is case-sensitive
3. Wait a moment and retry
4. Check browser console for detailed errors

### Setup Wizard Not Loading

**Blank page or spinner continues indefinitely**

Solutions:
1. Check browser console (F12) for JavaScript errors
2. Verify API endpoints are accessible:
   ```
   http://localhost:3000/api/setup/status
   ```
3. Check development server is running
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Database Details

### Schema Overview

#### Users Table
Stores authentication credentials and user information.

```
id (UUID) - Primary key
email (VARCHAR) - Unique, used for login
password_hash (VARCHAR) - Hashed password
full_name (VARCHAR) - User's display name
role (VARCHAR) - admin, manager, or employee
is_active (BOOLEAN) - Account status
created_at (TIMESTAMP) - Creation time
updated_at (TIMESTAMP) - Last update time
```

#### Employees Table
Links users to employee profiles with department and position.

```
id (UUID) - Primary key
user_id (UUID) - Foreign key to users
department (VARCHAR) - Department name
position (VARCHAR) - Job position
phone (VARCHAR) - Contact number
hire_date (DATE) - Employment start date
is_available (BOOLEAN) - Availability status
```

#### Shifts Table
Defines shift types and schedules.

```
id (UUID) - Primary key
name (VARCHAR) - Shift name (e.g., "Morning Shift")
start_time (TIME) - Shift start time
end_time (TIME) - Shift end time
description (TEXT) - Shift details
color (VARCHAR) - Color code for UI
is_active (BOOLEAN) - Shift status
```

#### Schedule_Assignments Table
Records employee assignments to shifts.

```
id (UUID) - Primary key
employee_id (UUID) - Foreign key to employees
shift_id (UUID) - Foreign key to shifts
scheduled_date (DATE) - Assignment date
is_confirmed (BOOLEAN) - Confirmation status
notes (TEXT) - Assignment notes
created_at (TIMESTAMP) - Creation time
UNIQUE(employee_id, shift_id, scheduled_date) - Prevents duplicates
```

### Database Indexes
Performance indexes are automatically created on:
- `users.email` - For login queries
- `employees.user_id` - For employee lookups
- `schedule_assignments.employee_id` - For schedule queries
- `schedule_assignments.scheduled_date` - For date range queries
- `notifications.user_id` - For notification queries
- `notifications.is_read` - For unread count queries
- `sessions.user_id` - For session lookups
- `sessions.token` - For token validation

## Advanced Configuration

### Production Environment

For production deployment:

1. **Environment Variables**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://prod_user:strong_password@prod_host:5432/shift_manager
   JWT_SECRET=generate-new-secure-secret
   NEXT_PUBLIC_API_URL=https://yourdomain.com
   ```

2. **Database Security**:
   - Use SSL connection: `?sslmode=require` in DATABASE_URL
   - Create limited-privilege database user
   - Use strong passwords
   - Regular backups enabled

3. **Application Security**:
   - Set `NEXT_PUBLIC_API_URL` to production domain
   - Enable HTTPS
   - Review CORS settings

### Custom Database Host

If using a remote database (e.g., AWS RDS, Heroku Postgres):

```env
DATABASE_URL=postgresql://user:password@remote-host.region.rds.amazonaws.com:5432/shift_manager?sslmode=require
```

## Next Steps After Setup

1. **Create Admin Account**: First account automatically gets admin role
2. **Access Admin Dashboard**: Navigate to `/admin` after login
3. **Create Shifts**: Define shift types (Morning, Evening, Night, etc.)
4. **Add Employees**: Register employees in the system
5. **Assign Shifts**: Create schedule assignments
6. **Invite Team**: Share login credentials with team members

## Support

If you encounter issues not covered here:

1. Check application logs in terminal
2. Review browser console (F12) for client-side errors
3. Verify all environment variables are set
4. Ensure PostgreSQL is running and accessible
5. Check `.env.local` for typos or formatting issues

## Quick Reference

### Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check database connection
psql $DATABASE_URL

# View setup page
open http://localhost:3000/setup
```

### Environment Variables Checklist

- [ ] DATABASE_URL is set
- [ ] DATABASE_URL format is correct
- [ ] PostgreSQL server is running
- [ ] Database user has CREATE permissions
- [ ] JWT_SECRET is configured
- [ ] .env.local file is in project root
- [ ] Development server has been restarted
