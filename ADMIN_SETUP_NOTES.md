# Admin User Creation - Important Setup Notes

## Current Implementation Status

The application uses `supabase.auth.admin.createUser()` in the User Management interface (see `src/components/admin/UserManagement.tsx`). This function requires **service role key** access, which is currently **not configured**.

## Why This Matters

- The **anon/public key** (currently used) has limited permissions
- Admin API operations require the **service role key**
- Service role key bypasses Row Level Security (RLS)
- Service role key should **NEVER** be exposed in client-side code

## Current Workaround

Until admin user creation is implemented server-side, admins must create users manually:

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Fill in user details
4. In **User Metadata** section, add:
   ```json
   {
     "name": "User Full Name",
     "role": "lawyer"
   }
   ```
5. For admin users, use `"role": "admin"`
6. Click **Create user**

The trigger function will automatically create the profile record.

### Method 2: Via SQL (Advanced)

1. Go to **SQL Editor**
2. Run:

```sql
-- Create auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@example.com',
  crypt('temporary_password', gen_salt('bf')),
  now(),
  '{"name": "User Name", "role": "lawyer"}'::jsonb,
  now(),
  now()
);

-- The profile will be created automatically by the trigger
```

## Production-Ready Solution (Future Enhancement)

For production use, implement one of these solutions:

### Option 1: Supabase Edge Function

Create an Edge Function to handle user creation server-side:

**File:** `supabase/functions/create-user/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create the new user
    const { name, email, password, role } = await req.json()

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data: newUser }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

Then update the client code to call this Edge Function instead of using the admin client directly.

### Option 2: Backend Service

If you have a backend service:

1. Create an API endpoint that uses the service role key
2. Verify the requesting user is an admin
3. Create users via the Supabase Admin API
4. Return success/error response

## Security Warning

**NEVER** expose the service role key in:
- Client-side code
- Git repositories
- Browser developer tools
- Frontend environment variables (even in production builds)

The service role key must ONLY be used:
- In Edge Functions (server-side)
- In backend services
- In server-side scripts
- In CI/CD pipelines (securely stored)

## Alternative: Simplified Admin Flow

If implementing Edge Functions is not immediately feasible:

1. Remove the "Add User" button from the admin UI
2. Document that admins must use the Supabase Dashboard
3. Add a note in the UI: "To create new users, use the Supabase Dashboard"
4. This is secure and functional, just requires admins to use the dashboard

---

**Current Status:** User creation via UI requires manual dashboard process
**Recommended:** Implement Edge Function for production use
**Security:** Current setup is safe (no service role key exposed)
