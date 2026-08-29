# Deployment Guide for RetailPass

This guide provides step-by-step instructions for deploying RetailPass to Vercel with proper environment configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Post-Deployment Testing](#post-deployment-testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at https://vercel.com
2. **Supabase Account** - Sign up at https://supabase.com (free tier available)
3. **GitHub Repository** - Your code should be pushed to GitHub
4. **Environment Variables Ready** - See the section below

## Environment Variables

RetailPass requires the following environment variables to function properly in production:

### Required Variables

#### 1. `JWT_SECRET` (CRITICAL)

This is used to sign and verify authentication tokens. **Your deployment will fail without this.**

**Generate a secure JWT secret:**

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Using online generator
# Visit https://generate-secret.vercel.app/32
```

Example output: `4636a0fadf85f69dffd7b269c0d39b4be19dc690d4432300514ebf624d899bf1`

#### 2. `SUPABASE_DATABASE_URL` (CRITICAL)

This is your PostgreSQL connection string from Supabase.

**Get your Supabase database URL:**

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Navigate to **Project Settings** (gear icon) → **Database**
4. Under **Connection string**, select **URI** mode
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual database password (set when creating the project)

Example format:

```
postgresql://postgres.xxxxx:YourPassword123@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

### Optional Variables

#### 3. `NODE_ENV` (Auto-set by Vercel)

Vercel automatically sets this to `production`. You don't need to configure it manually.

**Note:** RetailPass uses algorithmic password validation (pure TypeScript logic) and does not require any AI API keys. Password strength is analyzed using pattern matching, entropy calculations, and dictionary checks.

## Vercel Deployment

### Step 1: Connect Your Repository

1. Go to https://vercel.com/new
2. Click **Import Project**
3. Select your GitHub repository (`JonathanMwangiMaina/retailpass`)
4. Click **Import**

### Step 2: Configure Project Settings

1. **Framework Preset**: Vercel should auto-detect Next.js
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `.next` (default)
4. **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

This is the MOST CRITICAL step. Missing environment variables are the #1 cause of deployment failures.

1. In the Vercel import screen, expand **Environment Variables**
2. Add each variable one by one:

   | Name                    | Value                           | Notes                                    |
   | ----------------------- | ------------------------------- | ---------------------------------------- |
   | `JWT_SECRET`            | Your generated secret           | Use the output from crypto command above |
   | `SUPABASE_DATABASE_URL` | Your Supabase connection string | Must include password                    |

3. **IMPORTANT**: Make sure each variable is set for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **Deploy**

### Step 4: Run Database Migrations (First Deployment Only)

After your first deployment, you need to set up the database schema:

```bash
# Option 1: Run migrations locally pointing to Supabase
SUPABASE_DATABASE_URL="your-supabase-url" npx prisma migrate deploy

# Option 2: Use Prisma Studio to verify schema
SUPABASE_DATABASE_URL="your-supabase-url" npx prisma studio
```

Alternatively, you can push the schema directly:

```bash
SUPABASE_DATABASE_URL="your-supabase-url" npx prisma db push
```

### Step 5: Verify Deployment

Once deployment completes, Vercel will provide a URL like `https://retailpass.vercel.app`

## Post-Deployment Testing

### 1. Test the Health Endpoint

The health endpoint provides diagnostic information about your deployment.

**Visit**: `https://your-app.vercel.app/api/health`

**Expected response (SUCCESS):**

```json
{
  "status": "healthy",
  "timestamp": "2026-05-31T12:00:00.000Z",
  "environment": "production",
  "database": {
    "connected": true,
    "type": "PostgreSQL"
  },
  "prisma": {
    "initialized": true
  },
  "environmentVariables": {
    "JWT_SECRET": "configured",
    "DATABASE_URL": "configured",
    "SUPABASE_DATABASE_URL": "configured"
  }
}
```

**Warning response (MISSING VARIABLES):**

```json
{
  "status": "degraded",
  "timestamp": "2026-05-31T12:00:00.000Z",
  "environment": "production",
  "warnings": ["JWT_SECRET is not configured - authentication will fail", "Database connection not available"],
  "environmentVariables": {
    "JWT_SECRET": "missing",
    "DATABASE_URL": "missing",
    "SUPABASE_DATABASE_URL": "missing"
  }
}
```

### 2. Test User Registration

Try creating a test user:

1. Visit `https://your-app.vercel.app/signup`
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
3. Click **Sign Up**
4. You should be redirected to the profile page

### 3. Verify Database Persistence

1. Log out
2. Log back in with the same credentials
3. Verify your profile data persists

## Troubleshooting

### Issue 1: "Internal server error" on signup/login

**Symptoms:**

- Signup or login returns 500 error
- Health endpoint shows missing environment variables

**Solution:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify ALL required variables are present:
   - `JWT_SECRET`
   - `SUPABASE_DATABASE_URL`
3. If missing, add them and redeploy
4. After adding variables, click **Redeploy** (don't just save)

**Quick check:**

```bash
# Visit your health endpoint
curl https://your-app.vercel.app/api/health

# Look for:
# - "JWT_SECRET": "missing" ❌ → Add the variable
# - "JWT_SECRET": "configured" ✅ → Variable is set
```

### Issue 2: Database connection errors

**Symptoms:**

- Error: "Can't reach database server"
- Health endpoint shows `"connected": false`

**Solutions:**

1. **Verify Supabase URL is correct:**
   - URL should start with `postgresql://`
   - Must include password
   - Use the **pooler** URL (not direct connection)

2. **Check Supabase project status:**
   - Go to Supabase Dashboard
   - Ensure project is active (not paused)

3. **Verify database migrations:**
   ```bash
   SUPABASE_DATABASE_URL="your-url" npx prisma db push
   ```

### Issue 3: JWT_SECRET validation fails

**Symptoms:**

- Error: "JWT_SECRET is required but not configured"
- Authentication fails even with token

**Solution:**

1. Verify the JWT_SECRET is at least 32 characters long
2. Check for typos or extra spaces in the environment variable
3. Ensure it's set for all environments (Production, Preview, Development)
4. Redeploy after updating

### Issue 4: Build succeeds but runtime errors

**Symptoms:**

- Build completes successfully
- Application crashes when accessed
- Signup/login endpoints fail

**Why this happens:**

As of commit `b4e637e`, JWT_SECRET validation was moved from build-time to runtime. This means:

- ✅ Build will succeed even without JWT_SECRET
- ❌ Application will fail at runtime when users try to authenticate

**Solution:**

1. Check runtime environment variables (not just build-time)
2. Use health endpoint to diagnose: `/api/health`
3. Add missing variables and redeploy

### Issue 5: Changes not reflecting after deployment

**Symptoms:**

- Updated environment variables
- Changes don't appear in application

**Solution:**

1. **Environment variables require redeployment:**
   - Vercel Dashboard → Deployments
   - Click ⋮ (three dots) on latest deployment
   - Click **Redeploy**

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check deployment logs:**
   - Vercel Dashboard → Your deployment → View Function Logs
   - Look for errors during initialization

### Issue 6: Prisma migration errors

**Symptoms:**

- Error: "Table 'User' does not exist"
- Database queries fail

**Solution:**

1. **Push schema to Supabase:**

   ```bash
   SUPABASE_DATABASE_URL="your-url" npx prisma db push
   ```

2. **Or run migrations:**

   ```bash
   SUPABASE_DATABASE_URL="your-url" npx prisma migrate deploy
   ```

3. **Verify schema in Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Check that `User` table exists

## Environment Variable Checklist

Use this checklist before deploying:

- [ ] `JWT_SECRET` generated (32+ characters)
- [ ] `SUPABASE_DATABASE_URL` copied from Supabase dashboard
- [ ] Password in database URL is correct (no `[YOUR-PASSWORD]` placeholder)
- [ ] All variables added to Vercel (Production, Preview, Development)
- [ ] Database migrations run (`npx prisma db push` or `migrate deploy`)
- [ ] Health endpoint tested (`/api/health`)
- [ ] Test signup performed successfully

## Getting Help

If you're still experiencing issues:

1. **Check Function Logs:**
   - Vercel Dashboard → Your Project → Deployments → [Latest] → View Function Logs
   - Look for specific error messages

2. **Use Health Endpoint:**
   - Visit `/api/health` to see diagnostic information
   - Share the response when asking for help

3. **Verify Environment:**

   ```bash
   # Check what Vercel sees
   vercel env ls
   ```

4. **Common Error Messages:**

   | Error                    | Cause               | Fix                                   |
   | ------------------------ | ------------------- | ------------------------------------- |
   | "JWT_SECRET is required" | Missing JWT_SECRET  | Add environment variable              |
   | "Can't reach database"   | Wrong database URL  | Verify SUPABASE_DATABASE_URL          |
   | "Table does not exist"   | Missing migrations  | Run `prisma db push`                  |
   | "Invalid signature"      | JWT_SECRET mismatch | Ensure same secret across deployments |

## Best Practices

1. **Never commit `.env.local` to Git** - It contains secrets
2. **Use different JWT secrets for staging vs production**
3. **Rotate JWT_SECRET periodically** - Update and redeploy
4. **Enable Vercel's Environment Variable encryption** - It's on by default
5. **Use Vercel's Preview deployments** - Test before production
6. **Monitor your Supabase usage** - Free tier has limits
7. **Set up error tracking** - Use Vercel Analytics or Sentry

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

**Need help?** Open an issue on GitHub or check the health endpoint for diagnostic information.
