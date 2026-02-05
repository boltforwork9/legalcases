# Quick Migration Reference

This is a quick reference for migrating to a new Supabase project. For detailed instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## 🚀 Quick Steps

### 1. Apply Migrations

Go to Supabase Dashboard → SQL Editor and run these files **in order**:

1. `supabase/migrations/20260204171819_create_legal_case_system_schema.sql`
2. `supabase/migrations/20260204175528_fix_password_change_rls_policy.sql`

### 2. Get API Keys

Supabase Dashboard → Settings → API:

- Copy **Project URL**
- Copy **anon public** key

### 3. Create .env File

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create First Admin

Supabase Dashboard → Authentication → Users → Add user:

- Email: your@email.com
- Password: (secure password)
- Auto Confirm: ✅ Enable
- User Metadata:
  ```json
  {
    "name": "Your Name",
    "role": "admin"
  }
  ```

### 5. Run Application

```bash
npm install
npm run dev
```

Login with admin credentials → Change password → Start using!

## ⚠️ Important Notes

- **Never commit** the `.env` file
- **Service role key** should only be used server-side (see [ADMIN_SETUP_NOTES.md](./ADMIN_SETUP_NOTES.md))
- **User creation** from UI currently requires manual Supabase Dashboard process
- All data is stored in **Supabase** (no local storage)

## 📁 Migration Files

| File | Purpose |
|------|---------|
| `MIGRATION_GUIDE.md` | Complete migration instructions |
| `ADMIN_SETUP_NOTES.md` | Admin user creation details |
| `README.md` | Application documentation |
| `.env.example` | Environment variable template |
| `supabase/migrations/` | Database schema migrations |

## ✅ Verification Checklist

After migration, verify:

- [ ] All 4 tables exist (profiles, people, cases, search_logs)
- [ ] RLS is enabled on all tables
- [ ] Admin can login and access dashboard
- [ ] Admin can create people and cases
- [ ] Lawyer can search and view details
- [ ] Search logs are recorded

## 🔒 Security

- ✅ No hardcoded credentials in code
- ✅ Environment variables only
- ✅ Service role key NOT in client code
- ✅ RLS enabled on all tables
- ✅ `.env` in `.gitignore`

---

**Need help?** See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.
