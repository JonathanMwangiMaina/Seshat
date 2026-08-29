# 0006 - Role-Based Access Control (RBAC) with Three Roles

## Status
Accepted

## Context
RetailPass needs to distinguish between different user types with different permissions. Options evaluated:
- Simple boolean flags (isAdmin, isVendor)
- String role field with no enum
- Database enum with fixed roles
- External authorization service (OPA, Casbin)

## Decision
We will use a database enum `UserRole` with three roles: ADMIN, VENDOR, CUSTOMER.

## Rationale
- Database enum ensures data integrity at storage layer
- Three roles cover current business requirements
- Simple to understand and maintain
- No external dependency for authorization
- Extensible by adding new enum values via migration

## Implementation Details
- Prisma enum: `enum UserRole { ADMIN, VENDOR, CUSTOMER }`
- Default role: CUSTOMER
- Role assigned at signup (optional, defaults to CUSTOMER)
- Role returned in JWT payload and API responses
- Middleware returns role for route-level authorization
- Future: role guards in middleware for protected routes

## Consequences
- Role changes require database migration
- No fine-grained permissions (all ADMINs equal)
- Frontend must handle role-based UI conditionally
- API endpoints should validate role where needed