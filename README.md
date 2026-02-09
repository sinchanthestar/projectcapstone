# Shift Manager - Employee Shift Scheduling System

A comprehensive web-based employee shift scheduling system with role-based access control, conflict detection, notifications, and export functionality.

## Features

### Core Features
- **User Authentication**: Secure login and registration with role-based access (Admin, Manager, Employee)
- **Shift Management**: Create, edit, and manage shift types with flexible start/end times
- **Employee Management**: Manage team member profiles, departments, and availability status
- **Schedule Assignment**: Intuitive interface for assigning shifts to employees
- **Conflict Detection**: Automatic prevention of duplicate shift assignments
- **Notifications**: Real-time notifications for shift assignments and updates
- **Export Functionality**: Export schedules to CSV or JSON format
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Role-Based Access
- **Admins**: Full system control, manage all shifts and employees
- **Managers**: Create shifts, manage team schedules, assign shifts
- **Employees**: View personal schedule, see upcoming shifts, receive notifications

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server-Side Components
- **Database**: PostgreSQL (custom connection)
- **Authentication**: JWT with secure HTTP-only cookies
- **UI Components**: shadcn/ui, Radix UI
- **Utilities**: date-fns, zod, react-hook-form

## Database Schema

### Tables
- `users`: User accounts with authentication
- `employees`: Employee profiles linked to users
- `shifts`: Shift type definitions
- `schedule_assignments`: Shift assignments for specific dates
- `shift_swap_requests`: Shift swap requests (future)
- `notifications`: User notifications
- `sessions`: Authentication sessions

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Automatic Installation

1. **Configure Environment**:
   Create a `.env.local` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/shift_manager
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Automatic Setup Wizard**:
   - Open http://localhost:3000
   - System automatically redirects to `/setup`
   - Click "Initialize Database" to create all tables
   - Wait for tables to be created
   - Click "Create Admin Account" link
   - Register your first admin account
   - System redirects to admin dashboard

### Manual Database Setup (Optional)
If you prefer to set up the database manually:
```bash
psql -U your_user -d your_database -f scripts/01-init-database.sql
```

### Setup Wizard Features
- **Auto-Detection**: Checks database connection and schema status
- **Step-by-Step Process**: Visual guide through setup stages
- **Error Handling**: Clear error messages with troubleshooting tips
- **One-Click Setup**: Single button to initialize database
- **Progress Tracking**: Shows completion status of each step

## Setup API Endpoints

### Setup Initialization
- `GET /api/setup/status` - Check setup status and database connection
- `POST /api/setup/init` - Initialize database schema

### Setup Status Response
```json
{
  "isInitialized": false,
  "tablesCreated": false,
  "adminExists": false,
  "setupStep": "create-tables",
  "dbConfigured": true,
  "connectionValid": true
}
```

### Setup Wizard Page
- Visit `/setup` to access the interactive setup wizard
- Automatically redirects here if database not initialized
- Shows current status and next steps
- Provides clear error messages

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/session` - Get current session

### Shifts
- `GET /api/shifts` - List all shifts
- `POST /api/shifts` - Create shift
- `PUT /api/shifts/[id]` - Update shift
- `DELETE /api/shifts/[id]` - Delete shift

### Employees
- `GET /api/employees` - List employees
- `PUT /api/employees` - Update employee

### Assignments
- `GET /api/assignments` - List assignments with filters
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification

### Export
- `GET /api/export/schedule` - Export schedule (CSV/JSON)

## Features in Detail

### Conflict Detection
Prevents employees from being assigned multiple shifts on the same date automatically during assignment creation.

### Notifications
- **Shift Assignment**: Employees receive notifications when assigned to shifts
- **Shift Confirmation**: Notifications when assignments are confirmed
- **Real-time Updates**: Notification panel with polling (30-second intervals)

### Schedule Export
- Export schedules in CSV format for spreadsheets
- Export as JSON for programmatic use
- Filter by date range

### Responsive Interface
- Mobile-optimized views
- Touch-friendly controls
- Adaptive layouts for all screen sizes

## Usage Examples

### Creating a Shift
1. Navigate to Admin > Shifts
2. Click "New Shift"
3. Enter shift details (name, start time, end time)
4. Set color for visual identification
5. Click "Create Shift"

### Assigning a Shift
1. Navigate to Admin > Schedule
2. Click "Assign Shift"
3. Select employee and shift
4. Choose date
5. Click "Assign Shift"
6. Employee receives notification

### Exporting Schedule
1. Navigate to Admin > Schedule
2. Click "Export Schedule"
3. Select format (CSV or JSON)
4. Optionally filter by date range
5. Click "Export" to download

### Viewing Personal Schedule
1. Employee logs in
2. Navigates to "My Schedule"
3. Views upcoming shifts
4. Sees shift status (Pending/Confirmed)

## Security Features

- **Password Hashing**: PBKDF2 with salt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access Control**: Enforced at API level
- **Session Management**: Secure session handling

## Performance Optimizations

- Database indexes on frequently queried columns
- Efficient query patterns with proper joins
- Client-side caching with SWR
- Optimized date filtering
- Pagination support ready

## Future Enhancements

- Shift swap request system
- Recurring shift assignments
- Employee preferences and availability
- Analytics and reporting
- Email notifications
- Integration with calendar apps
- Mobile app version
- Advanced scheduling algorithms

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure database user has proper permissions

### Authentication Issues
- Clear browser cookies
- Verify JWT_SECRET is set
- Check token expiration

### Missing Assignments
- Verify employee exists
- Check shift is active
- Confirm no conflicts exist

## License

This project is built with v0 by Vercel.

## Support

For issues and questions, please check the application logs and verify all environment variables are properly configured.
