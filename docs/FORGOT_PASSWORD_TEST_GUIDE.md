# Quick Test Guide: Forgot Password Flow

## Prerequisites

1. **Apply the database migration:**

   ```bash
   npx prisma migrate dev
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

## Quick Test Steps

### 1. Start the Flow

- Open `http://localhost:3000/login`
- Click the "Forgot password?" link

### 2. Request Password Reset

- Enter a registered user's email
- Click "Send Reset Link"
- Check your terminal/console for the reset URL

### 3. Use the Reset Link

- Copy the URL that looks like:
  ```
  http://localhost:3000/reset-password?token=abc123...
  ```
- Paste it into your browser

### 4. Set New Password

- Enter a new password (min 8 characters)
- Watch the strength indicator update
- Confirm the password
- Click "Reset Password"

### 5. Login

- Wait 3 seconds for auto-redirect to login
- Login with your email and new password
- Success!

## What to Look For

### Console Output

When you request a password reset, you should see:

```
==============================================
PASSWORD RESET EMAIL
==============================================
To: user@example.com
Reset URL: http://localhost:3000/reset-password?token=...
Token: ...
==============================================
```

### Success Messages

- Forgot password page: "If an account with that email exists, a password reset link has been sent."
- Reset password page: "Password successfully reset! Redirecting to login page..."

### Error Handling

- Invalid token: "Invalid or expired reset token"
- Expired token: "Reset token has expired. Please request a new password reset."
- Short password: "Password must be at least 8 characters long"
- Password mismatch: "Passwords don't match."

## Security Notes

- The forgot password endpoint ALWAYS returns success, even for non-existent emails (prevents email enumeration)
- Tokens expire after 1 hour
- Tokens are single-use (cleared after successful reset)
- Passwords must be at least 8 characters

## Files to Check

If you need to verify the implementation:

- API endpoints: `/pages/api/auth/forgot-password.ts` and `/pages/api/auth/reset-password.ts`
- Frontend pages: `/pages/forgot-password.tsx` and `/pages/reset-password.tsx`
- Email utility: `/src/lib/email.ts`
- Migration: `/prisma/migrations/20260531150412_add_password_reset_fields/migration.sql`
