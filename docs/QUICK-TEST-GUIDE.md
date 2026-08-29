# Quick Test Guide - User Management (Seshat)

## 1. Apply Migration (Run Once)

```bash
cd /workspace/claude-workspace/jonathanmainast29_yahoo.com/JonathanMwangiMaina/retailpass
npx prisma migrate dev
```

## 2. Start Server

```bash
npm run dev
```

## 3. Quick Test Commands

### Create Users

```bash
# CUSTOMER (default role)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123","name":"Customer User"}' \
  -c customer.txt

# VENDOR
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@test.com","password":"password123","name":"Vendor User","role":"VENDOR"}' \
  -c vendor.txt

# ADMIN
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123","name":"Admin User","role":"ADMIN"}' \
  -c admin.txt
```

### Test Login (Returns Role)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@test.com","password":"password123"}'
```

### Update Password

```bash
curl -X PUT http://localhost:3000/api/profile/update-password \
  -H "Content-Type: application/json" \
  -b customer.txt \
  -d '{"oldPassword":"password123","newPassword":"newpass456"}'
```

### Delete Profile

```bash
curl -X DELETE http://localhost:3000/api/profile/delete \
  -b admin.txt
```

## 4. View Database

```bash
npx prisma studio
```

Or direct SQL:

```sql
SELECT id, email, name, role, "emailVerified", "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;
```

## 5. Expected Results

### Signup Response

```json
{
  "user": {
    "id": "cm0...",
    "email": "vendor@test.com",
    "name": "Vendor User",
    "role": "VENDOR",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Password Success

```json
{
  "message": "Password updated successfully"
}
```

### Delete Profile Success

```json
{
  "message": "Profile deleted successfully"
}
```

## 6. Common Errors

| Error                            | Status | Cause                          |
| -------------------------------- | ------ | ------------------------------ |
| "Invalid role..."                | 400    | Role not ADMIN/VENDOR/CUSTOMER |
| "Password must be at least 8..." | 400    | Password too short             |
| "Current password is incorrect"  | 401    | Wrong old password             |
| "Unauthorized - Please log in"   | 401    | Missing auth cookie            |
| "An account with this email..."  | 409    | Duplicate email                |

## 7. Cleanup

```sql
DELETE FROM "User" WHERE email LIKE '%@test.com';
```
