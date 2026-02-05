# Migration Verification Checklist

Use this checklist to verify your migration to a new Supabase project is complete and successful.

## Pre-Migration Verification

- [ ] New Supabase project has been created
- [ ] You have access to the Supabase Dashboard
- [ ] You have copied the Project URL and anon/public key

## Database Migration Verification

### Tables Created
- [ ] `profiles` table exists
- [ ] `people` table exists
- [ ] `cases` table exists
- [ ] `search_logs` table exists

### Verify in Supabase Dashboard:
Go to **Table Editor** and confirm all 4 tables are visible.

### Row Level Security (RLS) Enabled
- [ ] RLS enabled on `profiles`
- [ ] RLS enabled on `people`
- [ ] RLS enabled on `cases`
- [ ] RLS enabled on `search_logs`

### Verify in Supabase Dashboard:
Go to **Database** → **Policies** → Confirm RLS shows as "Enabled" for all tables.

### RLS Policies Created

#### profiles table
- [ ] "Authenticated users can view all profiles"
- [ ] "Only admins can insert profiles"
- [ ] "Only admins can update profiles"
- [ ] "Only admins can delete profiles"
- [ ] "Users can update own must_change_password"

#### people table
- [ ] "Authenticated users can view people"
- [ ] "Only admins can insert people"
- [ ] "Only admins can update people"
- [ ] "Only admins can delete people"

#### cases table
- [ ] "Authenticated users can view cases"
- [ ] "Only admins can insert cases"
- [ ] "Only admins can update cases"
- [ ] "Only admins can delete cases"

#### search_logs table
- [ ] "Users can insert their own search logs"
- [ ] "Users can view their own search logs"

### Verify in Supabase Dashboard:
Go to **Database** → **Policies** → Check each table for the policies listed above.

### Functions and Triggers
- [ ] `update_updated_at_column()` function exists
- [ ] `handle_new_user()` function exists
- [ ] Trigger on `people` table for auto-updating `updated_at`
- [ ] Trigger on `cases` table for auto-updating `updated_at`
- [ ] Trigger on `auth.users` for auto-creating profiles

### Verify in Supabase Dashboard:
Go to **SQL Editor** and run:
```sql
-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### Indexes Created
- [ ] `idx_people_full_name`
- [ ] `idx_people_national_id`
- [ ] `idx_cases_person_id`
- [ ] `idx_search_logs_user_id`
- [ ] `idx_search_logs_person_id`
- [ ] `idx_search_logs_searched_at`

### Verify in Supabase Dashboard:
Go to **SQL Editor** and run:
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Application Configuration Verification

- [ ] `.env` file created (not committed to git)
- [ ] `VITE_SUPABASE_URL` set in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`
- [ ] No hardcoded credentials in source code
- [ ] `.gitignore` includes `.env` file
- [ ] Dependencies installed (`npm install` completed)
- [ ] Build successful (`npm run build` completed)

## Authentication Verification

- [ ] Email provider enabled in Supabase Dashboard
- [ ] Email confirmation configured (disabled or properly set up)
- [ ] First admin user created in Supabase Dashboard
- [ ] Admin user has correct role in profile

### Verify Admin User:
Go to **SQL Editor** and run:
```sql
SELECT id, name, email, role, is_active, must_change_password
FROM profiles
WHERE role = 'admin';
```

Should return at least one admin user.

## Functional Testing

### Admin Tests
- [ ] Admin can login
- [ ] Admin must change password on first login
- [ ] After password change, admin sees dashboard
- [ ] Admin dashboard shows 4 tabs: Users, People, Cases, Search Logs

#### User Management Tab
- [ ] Admin can view list of users
- [ ] Admin can toggle user active/inactive status
- [ ] Admin can reset user passwords
- [ ] **Note:** Creating users from UI requires manual dashboard process (see ADMIN_SETUP_NOTES.md)

#### People Management Tab
- [ ] Admin can view list of people
- [ ] Admin can add new person
- [ ] Admin can edit person information
- [ ] Admin can delete person
- [ ] Deleting person cascades to their cases

#### Cases Management Tab
- [ ] Admin can view list of cases
- [ ] Admin can add new case (must select existing person)
- [ ] Admin can edit case information
- [ ] Admin can delete case
- [ ] Cases display with person information

#### Search Logs Tab
- [ ] Admin can view search logs
- [ ] Logs show: user name/email, person searched, timestamp
- [ ] Logs are sorted by most recent first

### Lawyer Tests

Create a test lawyer user via Supabase Dashboard:
```json
{
  "name": "Test Lawyer",
  "role": "lawyer"
}
```

- [ ] Lawyer can login
- [ ] Lawyer must change password on first login
- [ ] After password change, lawyer sees search interface
- [ ] Lawyer can search for people by name (partial match works)
- [ ] Search results show person name, national ID, and case count
- [ ] Clicking person shows detailed view
- [ ] Person details show all associated cases
- [ ] Case information displays correctly (type, court, number, status)
- [ ] Lawyer can navigate back to search
- [ ] Search operations are logged

#### Verify Search Logging:
As admin, go to Search Logs tab and verify lawyer's searches appear.

### Security Tests

#### Test Inactive User
1. As admin, disable a lawyer account
2. Try to login with that lawyer
3. [ ] Login should fail with appropriate error

#### Test RLS Policies
Via SQL Editor, run as a test:
```sql
-- Try to read people as unauthenticated (should fail)
SET ROLE anon;
SELECT * FROM people;
-- Should return: "permission denied for table people"

-- Reset
RESET ROLE;
```

- [ ] Unauthenticated users cannot access any data
- [ ] Only authenticated users can read data
- [ ] Only admins can write data

## Performance Verification

- [ ] Search by name is fast (< 1 second)
- [ ] Person details load quickly
- [ ] Dashboard tables load efficiently
- [ ] No console errors in browser

### Check in Browser DevTools:
- [ ] No 401/403 errors (unless testing security)
- [ ] No JavaScript errors
- [ ] Network requests complete successfully

## Data Integrity Verification

### Test Cascading Deletes
1. Create test person
2. Add test cases for that person
3. Delete the person
4. [ ] All associated cases are deleted automatically

### Test Unique Constraints
1. Try to add two people with same national ID
2. [ ] Second insert should fail with unique constraint error

### Test Foreign Keys
1. Try to add case with non-existent person_id
2. [ ] Insert should fail with foreign key error

## Documentation Verification

- [ ] `README.md` has migration links at the top
- [ ] `MIGRATION_GUIDE.md` exists and is complete
- [ ] `QUICK_MIGRATION_REFERENCE.md` exists
- [ ] `ADMIN_SETUP_NOTES.md` exists
- [ ] `.env.example` has all required variables
- [ ] Migration SQL files are in `supabase/migrations/`

## Final Checks

- [ ] All features work as expected
- [ ] No data loss occurred during migration
- [ ] All users can access their appropriate interfaces
- [ ] Search functionality works correctly
- [ ] Audit logging (search logs) is functioning
- [ ] No security warnings or errors
- [ ] Application is production-ready

## Rollback Plan (If Issues Found)

If you encounter issues:

1. **Stop the application**
2. **Check error logs** in browser console and network tab
3. **Verify environment variables** are correct
4. **Re-check database schema** against migration files
5. **Review RLS policies** are correctly applied
6. **Consult MIGRATION_GUIDE.md** for troubleshooting section

## Post-Migration Tasks

After successful migration:

- [ ] Update any deployment configurations
- [ ] Configure automated backups in Supabase Dashboard
- [ ] Set up monitoring and alerts
- [ ] Document any custom configurations
- [ ] Train admin users on manual user creation process
- [ ] Plan Edge Function implementation for user creation (if needed)

## Support Resources

- Application Documentation: `README.md`
- Migration Guide: `MIGRATION_GUIDE.md`
- Quick Reference: `QUICK_MIGRATION_REFERENCE.md`
- Admin Notes: `ADMIN_SETUP_NOTES.md`
- Supabase Docs: https://supabase.com/docs

---

**Migration Status:**
- Date: _____________
- Performed by: _____________
- New Project URL: _____________
- Issues encountered: _____________
- Resolution: _____________

**Sign-off:**
- [ ] Migration verified complete
- [ ] All tests passed
- [ ] Application ready for use
