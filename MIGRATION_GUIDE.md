# Supabase Project Migration Guide

This guide will help you migrate the Legal Case Search System to a new Supabase project.

## Prerequisites

- A new Supabase project created
- Access to the Supabase Dashboard
- Admin access to apply database migrations

## Step 1: Set Up New Supabase Project

1. Create a new Supabase project at https://supabase.com
2. Wait for the project to be fully provisioned

## Step 2: Apply Database Migrations

You have two options to apply the migrations:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Apply migrations in order:

   **First Migration - Create Schema:**
   - Open `supabase/migrations/20260204171819_create_legal_case_system_schema.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click **Run**

   **Second Migration - Fix RLS Policy:**
   - Open `supabase/migrations/20260204175528_fix_password_change_rls_policy.sql`
   - Copy the entire content
   - Paste into SQL Editor
   - Click **Run**

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your new project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

## Step 3: Verify Database Schema

After applying migrations, verify in your Supabase Dashboard:

1. Go to **Table Editor**
2. Confirm these tables exist:
   - `profiles`
   - `people`
   - `cases`
   - `search_logs`

3. Go to **Database** → **Policies**
4. Verify all RLS policies are enabled

## Step 4: Update Environment Variables

1. In your Supabase Dashboard, go to **Settings** → **API**

2. Copy the following values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon/public key** → This is your `VITE_SUPABASE_ANON_KEY`

3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**IMPORTANT:** Never commit the `.env` file to version control!

## Step 5: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **Email Templates**
4. **DISABLE** email confirmation (or configure as needed)
5. Go to **Authentication** → **URL Configuration**
6. Set the Site URL to your application URL

## Step 6: Create First Admin User

Since there's no public signup, you must create the first admin manually:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email:** admin@example.com (use your actual email)
   - **Password:** Create a secure password
   - **Auto Confirm User:** Enable this
4. Click **Create user**

5. After user is created, note the User UID

6. Go to **SQL Editor** and run:

```sql
-- Update the user's role to admin
UPDATE profiles
SET role = 'admin',
    name = 'Admin Name',
    is_active = true,
    must_change_password = true
WHERE id = 'USER_UID_HERE';
```

Replace `USER_UID_HERE` with the actual user ID.

## Step 7: Test the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Test the login with your admin credentials
4. You'll be prompted to change the password
5. After changing password, verify you can access the admin dashboard

## Step 8: Verify All Features

Test the following:

- ✅ Admin can create new users (lawyers and admins)
- ✅ Admin can add people
- ✅ Admin can add cases
- ✅ Lawyer can search for people
- ✅ Lawyer can view person details and cases
- ✅ Admin can view search logs
- ✅ Admin can enable/disable users
- ✅ Admin can reset user passwords

## Troubleshooting

### Issue: "Missing Supabase environment variables" Error

**Solution:** Ensure your `.env` file exists and contains valid values.

### Issue: Cannot create users (admin functionality)

**Problem:** The `supabase.auth.admin.createUser()` function requires service role access.

**Solution:** You have two options:

1. **Client-side with service role (NOT RECOMMENDED for production):**
   - Only use for testing or internal tools
   - Create a separate Supabase client with service role key
   - Keep service role key secure

2. **Server-side Edge Function (RECOMMENDED for production):**
   - Create a Supabase Edge Function
   - Handle user creation server-side
   - Use service role key in the Edge Function (server-side)

### Issue: RLS Policy Errors

**Solution:**
1. Verify all migrations were applied successfully
2. Check that RLS is enabled on all tables
3. Ensure the logged-in user has a profile record

### Issue: Users Cannot Change Password

**Solution:** Ensure the second migration file was applied (fixes the RLS policy for password changes).

## Security Checklist

Before going to production:

- [ ] `.env` file is in `.gitignore` (already configured)
- [ ] No hardcoded credentials in source code
- [ ] All RLS policies are enabled and tested
- [ ] Service role key is never exposed on client-side
- [ ] Email confirmation is configured properly
- [ ] Strong password policy is enforced
- [ ] Admin users are properly secured

## Environment Variables Reference

| Variable | Required | Description | Location in Supabase Dashboard |
|----------|----------|-------------|--------------------------------|
| `VITE_SUPABASE_URL` | Yes | Project URL | Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anonymous/Public Key | Settings → API → Project API keys → anon/public |

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is available in the Supabase Dashboard under Settings → API → Service Role Key, but should ONLY be used server-side (in Edge Functions or backend services), never in client-side code.

## Migration Rollback

If you need to rollback the database:

1. Go to **SQL Editor**
2. Run the following to drop all tables:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS search_logs CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

3. Re-apply migrations from Step 2

## Next Steps After Migration

1. Import existing data (if migrating from another system)
2. Test thoroughly in staging environment
3. Configure backup policies in Supabase Dashboard
4. Set up monitoring and alerts
5. Document any custom configurations

## Support

For issues specific to:
- **Supabase:** Check https://supabase.com/docs
- **Application:** Review the README.md file
- **Database Schema:** Review migration files in `supabase/migrations/`

---

**Last Updated:** 2026-02-05
**Compatible with:** Supabase Platform Version 1.0+
