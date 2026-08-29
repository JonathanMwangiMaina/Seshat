# User Management Testing Guide

This guide provides comprehensive testing for the user management functionality with role support.

## Prerequisites

1. Run the database migration:
```bash
cd /workspace/claude-workspace/jonathanmainast29_yahoo.com/JonathanMwangiMaina/retailpass
npx prisma migrate dev
```

2. Start the development server:
```bash
npm run dev
```

## Test Cases

### 1. Test Signup with Different Roles

#### Test 1.1: Create CUSTOMER (Default Role)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "name": "Test Customer"
  }' \
  -c cookies-customer.txt \
  -v
```

**Expected Response:**
- Status: 201 Created
- Body includes: `{ "user": { "id": "...", "email": "customer@test.com", "name": "Test Customer", "role": "CUSTOMER", ... } }`
- Sets auth cookie

#### Test 1.2: Create VENDOR
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "password123",
    "name": "Test Vendor",
    "role": "VENDOR"
  }' \
  -c cookies-vendor.txt \
  -v
```

**Expected Response:**
- Status: 201 Created
- Body includes: `{ "user": { ..., "role": "VENDOR", ... } }`

#### Test 1.3: Create ADMIN
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "name": "Test Admin",
    "role": "ADMIN"
  }' \
  -c cookies-admin.txt \
  -v
```

**Expected Response:**
- Status: 201 Created
- Body includes: `{ "user": { ..., "role": "ADMIN", ... } }`

#### Test 1.4: Invalid Role
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@test.com",
    "password": "password123",
    "role": "SUPERUSER"
  }' \
  -v
```

**Expected Response:**
- Status: 400 Bad Request
- Body: `{ "error": "Invalid role. Must be ADMIN, VENDOR, or CUSTOMER" }`

### 2. Test Login (Verify Role Returned)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "password123"
  }' \
  -c cookies-vendor-login.txt \
  -v
```

**Expected Response:**
- Status: 200 OK
- Body includes role: `{ "user": { ..., "role": "VENDOR", ... } }`

### 3. Test Update Password

#### Test 3.1: Successful Password Update
```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -b cookies-customer.txt \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }' \
  -v
```

**Expected Response:**
- Status: 200 OK
- Body: `{ "message": "Password updated successfully" }`

#### Test 3.2: Verify New Password Works
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "newpassword456"
  }' \
  -v
```

**Expected Response:**
- Status: 200 OK
- Login successful

#### Test 3.3: Incorrect Old Password
```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -b cookies-vendor.txt \
  -d '{
    "oldPassword": "wrongpassword",
    "newPassword": "newpassword456"
  }' \
  -v
```

**Expected Response:**
- Status: 401 Unauthorized
- Body: `{ "error": "Current password is incorrect" }`

#### Test 3.4: Unauthenticated Request
```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }' \
  -v
```

**Expected Response:**
- Status: 401 Unauthorized
- Body: `{ "error": "Unauthorized - Please log in" }`

#### Test 3.5: Same Old and New Password
```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -b cookies-vendor.txt \
  -d '{
    "oldPassword": "password123",
    "newPassword": "password123"
  }' \
  -v
```

**Expected Response:**
- Status: 400 Bad Request
- Body: `{ "error": "New password must be different from old password" }`

#### Test 3.6: Weak New Password
```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -b cookies-vendor.txt \
  -d '{
    "oldPassword": "password123",
    "newPassword": "123"
  }' \
  -v
```

**Expected Response:**
- Status: 400 Bad Request
- Body: `{ "error": "New password must be at least 8 characters long" }`

### 4. Test Profile Deletion

#### Test 4.1: Successful Profile Deletion
```bash
curl -X DELETE http://localhost:3000/api/profile/delete \
  -b cookies-admin.txt \
  -v
```

**Expected Response:**
- Status: 200 OK
- Body: `{ "message": "Profile deleted successfully" }`
- Auth cookie cleared

#### Test 4.2: Verify User Cannot Login After Deletion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }' \
  -v
```

**Expected Response:**
- Status: 401 Unauthorized
- Body: `{ "error": "Invalid email or password" }`

#### Test 4.3: Unauthenticated Deletion Request
```bash
curl -X DELETE http://localhost:3000/api/profile/delete \
  -v
```

**Expected Response:**
- Status: 401 Unauthorized
- Body: `{ "error": "Unauthorized - Please log in" }`

### 5. Test Database Persistence

#### Test 5.1: Direct Database Query (After Migration)
```bash
cd /workspace/claude-workspace/jonathanmainast29_yahoo.com/JonathanMwangiMaina/retailpass
npx prisma studio
```

Or use SQL:
```sql
SELECT id, email, name, role, "emailVerified", "createdAt", "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC;
```

**Expected Results:**
- All users visible with their roles
- CUSTOMER role for users created without explicit role
- VENDOR and ADMIN roles for explicitly created users

## API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/signup` | POST | No | Create new user with optional role |
| `/api/auth/login` | POST | No | Login and get auth token |
| `/api/profile/update-password` | PUT/PATCH | Yes | Update user password |
| `/api/profile/delete` | DELETE | Yes | Delete user profile |

## Request/Response Examples

### Signup Request
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "VENDOR"  // Optional: ADMIN, VENDOR, or CUSTOMER (default)
}
```

### Signup Response (Success)
```json
{
  "user": {
    "id": "cm0abc123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "VENDOR",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Password Request
```json
{
  "oldPassword": "currentpassword123",
  "newPassword": "newsecurepassword456"
}
```

### Update Password Response (Success)
```json
{
  "message": "Password updated successfully"
}
```

### Delete Profile Response (Success)
```json
{
  "message": "Profile deleted successfully"
}
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required or invalid credentials)
- `404` - Not Found (user doesn't exist)
- `405` - Method Not Allowed
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection issues)

## Cleanup After Testing

To remove test users from the database:

```sql
DELETE FROM "User" WHERE email LIKE '%@test.com';
```

Or use Prisma Studio to manually delete test users.
