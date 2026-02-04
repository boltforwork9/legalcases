# Legal Case Search System

A secure internal legal case search system for lawyers with role-based access control, powered by Supabase.

## Features

### Authentication & Authorization
- Secure email/password authentication via Supabase Auth
- No public signup - only admins can create user accounts
- Two user roles: **Admin** and **Lawyer**
- Force password change on first login
- Active/inactive user status management

### For Lawyers
- **Search People**: Search by name (partial or full match)
- **View Person Details**: See full information including:
  - Full name
  - National ID
  - Complete list of associated cases
- **Case Information**: For each case, view:
  - Case type
  - Court name
  - Case number
  - Status (Open, Pending, Closed)

### For Admins
Complete management dashboard with four sections:

1. **User Management**
   - Create new lawyer and admin accounts
   - Enable/disable user accounts
   - Reset user passwords
   - View all user information

2. **People Management**
   - Add new people to the system
   - Edit person information
   - Delete people (cascades to their cases)
   - View all people with their details

3. **Cases Management**
   - Add new cases linked to people
   - Edit existing case information
   - Delete cases
   - View all cases with person details

4. **Search Logs**
   - Audit trail of all searches
   - See who searched for whom and when
   - Helps track system usage and compliance

## Security Features

### Row Level Security (RLS)
All database tables have RLS enabled with restrictive policies:

- **Profiles**: All authenticated users can read; only admins can write
- **People**: All authenticated users can read; only admins can write
- **Cases**: All authenticated users can read; only admins can write
- **Search Logs**: Users can insert and view their own logs; admins can view all

### Audit Trail
Every search operation is automatically logged with:
- User who performed the search
- Person being searched
- Timestamp of the search

### Data Protection
- All API calls protected with JWT authentication
- Inactive users cannot access the system
- Secure password management with forced changes
- No sensitive data exposure in client-side code

## Database Schema

### profiles
- `id` - User ID (references auth.users)
- `name` - Full name
- `email` - Email address
- `role` - User role (admin/lawyer)
- `is_active` - Account status
- `must_change_password` - Force password change flag
- `created_at` - Account creation timestamp

### people
- `id` - Unique identifier
- `full_name` - Full name
- `national_id` - National ID (unique)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### cases
- `id` - Unique identifier
- `person_id` - Link to person
- `case_type` - Type of case
- `court_name` - Court name
- `case_number` - Case number
- `status` - Current status
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### search_logs
- `id` - Unique identifier
- `user_id` - User who searched
- `person_id` - Person searched for
- `searched_at` - Search timestamp

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

The database schema has already been created with the migration. It includes:
- All tables with proper relationships
- Row Level Security policies
- Indexes for optimal performance
- Automatic triggers for timestamp updates
- Auto-creation of profiles when users are created

### 3. Create First Admin User

You'll need to create your first admin user directly in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" and create a user with:
   - Email and password
   - In the "User Metadata" section, add:
     ```json
     {
       "name": "Admin Name",
       "role": "admin"
     }
     ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Usage

### First Login
1. When first admin logs in, they must change their password
2. After changing password, they gain access to the admin dashboard

### Creating Users (Admin)
1. Go to the "Users" tab in admin dashboard
2. Click "Add User"
3. Fill in name, email, password, and select role
4. New user will be forced to change password on first login

### Adding People & Cases (Admin)
1. First add people in the "People" tab
2. Then add cases linked to those people in the "Cases" tab
3. Each case must be associated with an existing person

### Searching (Lawyer)
1. Lawyers see the search interface upon login
2. Enter a name (full or partial) to search
3. Click on any person to view their full details and cases
4. All searches are automatically logged

### Viewing Search Logs (Admin)
1. Go to the "Search Logs" tab
2. See complete audit trail of all searches
3. Track who accessed what information and when

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite

## Security Best Practices

1. Never commit the `.env` file to version control
2. Use strong passwords for all accounts
3. Regularly review search logs for compliance
4. Disable inactive user accounts immediately
5. Keep Supabase and dependencies up to date
6. Use the service role key only server-side (not needed for this app)

## Production Deployment

Before deploying to production:

1. Ensure all environment variables are properly configured
2. Review and test all RLS policies
3. Set up proper backup procedures for your Supabase database
4. Configure domain and SSL certificates
5. Set up monitoring and error tracking
6. Review user access and permissions

## Support

For issues or questions:
- Check Supabase documentation for database and auth issues
- Review RLS policies if experiencing permission errors
- Ensure environment variables are correctly set
- Verify user roles and active status for access issues
