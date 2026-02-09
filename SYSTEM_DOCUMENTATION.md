# System Architecture Documentation

## System Overview

The Shift Manager is a comprehensive employee shift scheduling system built with Next.js 16, featuring:

- **Automated Setup Wizard**: One-click database initialization
- **Role-Based Access Control**: Admin, Manager, and Employee roles
- **Real-Time Notifications**: Instant shift assignment notifications
- **Conflict Detection**: Prevents duplicate shift assignments
- **Schedule Export**: CSV and JSON export options
- **Responsive Design**: Mobile-optimized interfaces
- **Secure Authentication**: JWT tokens with HTTP-only cookies

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  (React Components, Next.js Client Components)           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Middleware / Proxy Layer                   │
│  (Setup Check, Authentication Guard)                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          Next.js API Routes (Backend)                   │
│  ├── /api/setup (Database initialization)              │
│  ├── /api/auth (Authentication)                        │
│  ├── /api/shifts (Shift management)                    │
│  ├── /api/employees (Employee management)              │
│  ├── /api/assignments (Schedule assignments)           │
│  └── /api/notifications (Notifications)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Database Abstraction Layer                   │
│  (Query Builder, Connection Pool)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         PostgreSQL Database                             │
│  (Tables, Indexes, Relations)                           │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Setup System (`/lib/setup.ts`)

**Purpose**: Automated database initialization and status checking

**Key Functions**:
- `checkSetupStatus()` - Verifies database initialization state
- `initializeDatabase()` - Creates all necessary tables
- `validateDatabaseConnection()` - Tests database connectivity
- `getDatabaseStatus()` - Checks environment configuration

**Setup Workflow**:
1. Check DATABASE_URL configured
2. Test connection to database
3. Check if schema tables exist
4. Check if admin user exists
5. Return current setup step

### 2. Authentication System (`/lib/auth.ts`)

**Purpose**: Secure user authentication and session management

**Key Functions**:
- `hashPassword()` - Securely hash passwords using PBKDF2
- `verifyPassword()` - Compare passwords with hashes
- `generateToken()` - Create JWT tokens
- `verifyToken()` - Validate JWT tokens
- `getSession()` - Retrieve current user session
- `setAuthCookie()` - Set secure HTTP-only cookies
- `clearAuthCookie()` - Clear authentication cookies

**Security Features**:
- PBKDF2 password hashing with salt
- 1000 iterations for key derivation
- JWT with HS256 algorithm
- HTTP-only cookies prevent XSS
- 24-hour token expiration
- Secure-flag for production

### 3. Database Layer (`/lib/db.ts`)

**Purpose**: Manages PostgreSQL connections and queries

**Key Features**:
- Connection pooling (20 max connections)
- Parameterized queries prevent SQL injection
- Transaction support for atomic operations
- Single and multi-row query methods

**Available Methods**:
```typescript
query<T>(text, params) -> Promise<{rows: T[], rowCount: number}>
queryOne<T>(text, params) -> Promise<T | null>
transaction<T>(callback) -> Promise<T>
closePool() -> Promise<void>
```

### 4. Setup Wizard Component (`/components/setup/setup-wizard.tsx`)

**Purpose**: Interactive UI for database initialization

**Features**:
- Multi-step wizard interface
- Visual progress indicators
- Real-time status checking
- Error handling and recovery suggestions
- Auto-redirect on completion

**States**:
- Loading database status
- Database not configured
- Connection failed
- Initializing schema
- Creating admin account
- Fully initialized

### 5. API Route Handlers

#### Setup Routes
- `GET /api/setup/status` - Check setup completion
- `POST /api/setup/init` - Initialize database

#### Authentication Routes
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

#### Shift Management Routes
- `GET /api/shifts` - List all shifts
- `POST /api/shifts` - Create new shift
- `PUT /api/shifts/[id]` - Update shift
- `DELETE /api/shifts/[id]` - Delete shift

#### Employee Management Routes
- `GET /api/employees` - List employees
- `PUT /api/employees` - Update employee

#### Assignment Routes
- `GET /api/assignments` - List assignments (with conflict check)
- `POST /api/assignments` - Create assignment with conflict detection
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

#### Notification Routes
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification

#### Export Routes
- `GET /api/export/schedule` - Export schedule (CSV/JSON)

#### Health Check
- `GET /api/health` - System health status

## Database Schema

### Tables and Relationships

```
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── full_name (VARCHAR)
├── role (VARCHAR)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
    ↓
    └── employees (1:1)
        ├── id (UUID, PK)
        ├── user_id (UUID, FK)
        ├── department (VARCHAR)
        ├── position (VARCHAR)
        ├── phone (VARCHAR)
        ├── hire_date (DATE)
        ├── is_available (BOOLEAN)
        ├── created_at (TIMESTAMP)
        └── updated_at (TIMESTAMP)
            ↓
            └── schedule_assignments (1:N)
                ├── id (UUID, PK)
                ├── employee_id (UUID, FK)
                ├── shift_id (UUID, FK)
                ├── scheduled_date (DATE)
                ├── is_confirmed (BOOLEAN)
                ├── notes (TEXT)
                ├── created_at (TIMESTAMP)
                └── updated_at (TIMESTAMP)

shifts
├── id (UUID, PK)
├── name (VARCHAR)
├── start_time (TIME)
├── end_time (TIME)
├── description (TEXT)
├── color (VARCHAR)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── type (VARCHAR)
├── title (VARCHAR)
├── message (TEXT)
├── is_read (BOOLEAN)
├── data (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

sessions
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── token (VARCHAR, UNIQUE)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### Database Indexes

```
users:
  - idx_users_email → Fast email lookups for login

employees:
  - idx_employees_user_id → Join optimization

schedule_assignments:
  - idx_schedule_assignments_employee_id → Employee schedule queries
  - idx_schedule_assignments_scheduled_date → Date range queries

notifications:
  - idx_notifications_user_id → User notification retrieval
  - idx_notifications_is_read → Unread notification count

sessions:
  - idx_sessions_user_id → User session lookups
  - idx_sessions_token → Token validation
```

## Security Implementation

### Password Security
- **Algorithm**: PBKDF2 with SHA512
- **Iterations**: 1000
- **Salt**: 16-byte random salt per password
- **Storage**: `salt:hash` format

### Authentication Tokens
- **Type**: JSON Web Tokens (JWT)
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Payload**: User ID, Email, Full Name, Role
- **Storage**: HTTP-only cookies

### SQL Injection Prevention
- All queries use parameterized queries
- User input never concatenated into SQL
- Parameters bound via `$1, $2, etc.` placeholders

### Cross-Site Scripting (XSS)
- HTTP-only cookies prevent JavaScript access
- React automatic escaping of values
- Content Security Policy headers (production)

### Cross-Site Request Forgery (CSRF)
- SameSite cookies set to 'lax'
- Token verification on state-changing operations

## Data Flow

### User Registration Flow
```
1. User submits registration form
2. Client validates input (8+ char password)
3. POST /api/auth/register
4. Server validates email (unique), password strength
5. Server hashes password with salt
6. Server creates user record with 'employee' role
7. Server creates employee record
8. Server generates JWT token
9. Server sets HTTP-only cookie
10. Client redirects to /employee dashboard
```

### Shift Assignment Flow
```
1. Admin selects employee, shift, date
2. POST /api/assignments with assignment data
3. Server checks for conflicts (same employee, shift, date)
4. Server prevents duplicate assignments
5. Server creates schedule_assignment record
6. Server notifies employee of assignment
7. POST /api/notifications to create notification
8. Client updates UI with new assignment
9. Employee receives real-time notification
```

### Conflict Detection
```
1. Before creating assignment:
   a. Query: SELECT * FROM schedule_assignments 
      WHERE employee_id = ? 
      AND shift_id = ? 
      AND scheduled_date = ?
   b. If any results, conflict exists
2. Prevent creation with error response
3. Return conflict details to user
```

## Performance Optimizations

### Database
- Connection pooling (20 simultaneous connections)
- Prepared queries reduce parsing overhead
- Indexes on frequently queried columns
- Foreign key constraints maintain data integrity

### API
- JSON response compression
- Minimal database queries per endpoint
- Efficient pagination support

### Frontend
- SWR for client-side caching
- Incremental static regeneration
- Code splitting per route

## Configuration

### Environment Variables
```
DATABASE_URL       - PostgreSQL connection string
JWT_SECRET         - Secret key for JWT signing
NODE_ENV          - development/production
NEXT_PUBLIC_API_URL - Client-side API endpoint
```

### Database Connection Pool
```
max: 20 connections
idleTimeoutMillis: 30 seconds
connectionTimeoutMillis: 2 seconds
```

### JWT Token Configuration
```
Algorithm: HS256
Expiration: 24 hours
Issuer: shift-manager
Audience: web-app
```

## Error Handling

### API Error Responses
```
{
  "error": "Error message",
  "details": "Additional details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Login failed
- `USER_EXISTS` - Email already registered
- `CONFLICT_DETECTED` - Shift conflict exists
- `UNAUTHORIZED` - Missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input

## Monitoring

### Health Check Endpoint
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-29T12:00:00Z",
  "database": {
    "connected": true,
    "initialized": true,
    "tablesCreated": true,
    "adminExists": true
  },
  "uptime": 3600,
  "environment": "development"
}
```

## Scalability Considerations

### Current Limitations
- Suitable for small teams (5-50 employees)
- Single database instance
- All users in same organization

### Future Scalability
- Multi-tenant architecture
- Database replication
- Read replicas for reporting
- Cache layer (Redis)
- Message queue for notifications
- Microservices architecture

## Deployment Considerations

### Production Checklist
- [ ] Strong JWT_SECRET generated
- [ ] Database backups configured
- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Error logging setup
- [ ] Monitoring enabled
- [ ] Database optimization indexes created

### Deployment Steps
1. Build optimized bundle: `npm run build`
2. Set production environment variables
3. Configure database backups
4. Deploy to hosting platform
5. Run migration scripts if needed
6. Monitor application health
7. Set up SSL certificate
8. Configure CDN for static assets

## Testing Strategy

### Unit Tests
- Authentication functions
- Password hashing
- Conflict detection logic

### Integration Tests
- API endpoints
- Database operations
- Error handling

### E2E Tests
- Complete user workflows
- Registration to schedule creation
- Assignment and notifications

## Maintenance

### Regular Tasks
- Monitor database performance
- Check application logs
- Verify backups
- Update dependencies
- Review security patches

### Database Maintenance
- Analyze and optimize indexes
- Check query performance
- Monitor connection pool
- Archive old notifications
- Cleanup expired sessions

## Support and Debugging

### Common Issues and Solutions

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Test connection manually: `psql $DATABASE_URL`

2. **Setup Wizard Not Loading**
   - Check browser console errors
   - Verify API endpoints accessible
   - Try hard refresh (Ctrl+Shift+R)

3. **Slow Queries**
   - Check database indexes
   - Monitor connection pool usage
   - Review slow query logs

4. **Authentication Issues**
   - Clear browser cookies
   - Verify JWT_SECRET hasn't changed
   - Check token expiration

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [OWASP Security](https://owasp.org/www-project-top-ten)
