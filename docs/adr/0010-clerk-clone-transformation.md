# 0010 - Transform RetailPass into Production-Grade Clerk Clone with Flexible RBAC

## Status

Accepted

## Context

RetailPass v1.2.0 is a solid authentication platform with:
- Next.js 16 + React 19 + Prisma 6 + Supabase PostgreSQL
- JWT in HTTP-only cookies, bcrypt password hashing
- Fixed 3-role RBAC (ADMIN, VENDOR, CUSTOMER)
- Basic user management (signup, login, profile, password reset)

Clerk provides a production-grade authentication platform with:
- Multi-tenant Organizations (shared user pool model)
- Flexible RBAC with custom roles/permissions per organization
- Hybrid session model (60s JWT + long-lived client token + refresh)
- Webhooks for real-time data sync
- Organization switcher, verified domains, enterprise SSO
- Drop-in React components for auth UI
- Session claims with org context, permissions, metadata

## Decision

Transform RetailPass into a Clerk-like authentication platform with the following architecture:

### 1. Data Model: Multi-Tenant Organizations

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  passwordHash    String
  emailVerified   Boolean   @default(false)
  imageUrl        String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  organizations   OrganizationMembership[]
  sessions        Session[]
  clients         Client[]
}

model Organization {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  imageUrl        String?
  publicMetadata  Json      @default("{}")
  privateMetadata Json      @default("{}")
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  memberships     OrganizationMembership[]
  domains         VerifiedDomain[]
  roleSets        RoleSet[]
}

model OrganizationMembership {
  id              String    @id @default(cuid())
  userId          String
  organizationId  String
  role            String    // e.g., "org:admin", "org:member", "org:billing"
  publicMetadata  Json      @default("{}")
  privateMetadata Json      @default("{}")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([userId, organizationId])
}

model Role {
  id              String    @id @default(cuid())
  key             String    @unique // e.g., "org:admin", "org:manager", "org:billing"
  name            String
  description     String?
  isDefault       Boolean   @default(false)
  isSystem        Boolean   @default(false)
  permissions     Permission[]
  roleSets        RoleSet[]
}

model Permission {
  id          String    @id @default(cuid())
  key         String    @unique // e.g., "org:tasks:create", "org:billing:manage"
  name        String
  description String?
  resource    String
  action      String
  conditions  Json?     // Optional conditions for dynamic permissions
  roles       Role[]
}

model RoleSet {
  id              String    @id @default(cuid())
  key             String    @unique
  name            String
  description     String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  organizationId  String?
  roles           Role[]
  @@unique([key, organizationId])
}

model VerifiedDomain {
  id              String    @id @default(cuid())
  organizationId  String
  domain          String    @unique
  status          VerificationStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  verifiedAt      DateTime?
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

model Session {
  id              String    @id @default(cuid())
  userId          String
  clientId        String
  status          SessionStatus @default(ACTIVE)
  lastActiveAt    DateTime  @default(now())
  expireAt        DateTime
  abandonedAt     DateTime?
  publicMetadata  Json      @default("{}")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  client          Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
}

model Client {
  id              String    @id @default(cuid())
  userId          String
  name            String?   // Device/browser name
  userAgent       String?
  ipAddress       String?
  lastActiveAt    DateTime  @default(now())
  createdAt       DateTime  @default(now())
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions        Session[]
}

enum VerificationStatus {
  PENDING
  VERIFIED
  FAILED
}

enum SessionStatus {
  ACTIVE
  REVOKED
  ENDED
}
```

### 2. Hybrid Session Model (Clerk-style)

**Two-Token Architecture:**
- **Client Token** (`__client` cookie): Long-lived (30 days), HttpOnly, Secure, SameSite=Lax
  - Source of truth for authentication state
  - Stored in `Client` table, enables remote sign-out
  
- **Session Token** (`__session` cookie): Short-lived (60s), HttpOnly, Secure, SameSite=Strict
  - JWT with claims: `sub`, `sid`, `org_id`, `org_role`, `org_permissions`, `org_slug`
  - Refreshes every 50s via background request to `/api/auth/refresh`

**Token Refresh Flow:**
```
Client (50s interval) → POST /api/auth/refresh (with __client cookie)
  → Validate client token in DB
  → Generate new session token JWT (60s expiry)
  → Return { sessionToken } → Set __session cookie
```

### 3. Flexible RBAC System

**Permission Format:** `{resource}:{action}` (e.g., `org:members:manage`, `org:billing:read`)

**Role Structure:**
- System roles: `org:admin` (all permissions), `org:member` (read-only)
- Custom roles: Created per application, assigned to Role Sets
- Role Sets control which roles are available per organization

**Authorization Checks:**
```typescript
// Frontend hook
const { has } = useAuth()
const canManageBilling = has({ permission: 'org:billing:manage' })

// Backend middleware
const { has } = await auth()
if (!has({ role: 'org:admin' })) throw new ForbiddenError()
```

### 4. Webhook System for Data Sync

**Events to Emit:**
- `user.created`, `user.updated`, `user.deleted`
- `session.created`, `session.revoked`, `session.ended`
- `organization.created`, `organization.updated`, `organization.deleted`
- `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`
- `organizationInvitation.created`, `organizationInvitation.accepted`, `organizationInvitation.revoked`

**Webhook Handler:**
```typescript
POST /api/webhooks/clerk
  → Verify Svix signature
  → Process event type
  → Update local DB (upsert user, sync org membership, etc.)
```

### 5. Organization Context & Switching

**Active Organization:** Stored in session claims, switchable via UI
- Tab-independent (each tab maintains own active org)
- `useOrganization()` hook for frontend
- `auth()` returns `orgId`, `orgRole`, `orgPermissions` for backend

### 6. Drop-in UI Components Pattern

Build reusable React components (like Clerk's):
- `<SignIn />`, `<SignUp />`, `<UserButton />`
- `<OrganizationSwitcher />`, `<OrganizationProfile />`
- `<OrganizationList />` (for admin management)
- `<AuthGuard />` (route protection by role/permission)

### 7. API Structure

```
/api/auth/
  ├── signup, login, logout, me
  ├── refresh (session token refresh)
  ├── password (change, reset, forgot)
  ├── session (list, revoke)
  └── verify-email, verify-phone

/api/organizations/
  ├── list, create, get, update, delete
  ├── members (list, invite, update, remove)
  ├── invitations (create, revoke, accept)
  ├── roles (list, create, update, delete)
  ├── permissions (list)
  ├── domains (add, verify, remove)
  └── switch (set active organization)

/api/webhooks/
  └── clerk (receive Clerk-style events)
```

## Implementation Phases

### Phase 1: Core Data Model & Sessions (Week 1)
- [ ] Add Prisma models for Organization, Membership, Role, Permission, Session, Client
- [ ] Migrate existing users to new schema
- [ ] Implement hybrid session model (client token + session token)
- [ ] Add token refresh endpoint
- [ ] Add session/device management API

### Phase 2: Organizations & RBAC (Week 2)
- [ ] Organization CRUD + membership management
- [ ] Role/Permission system with Role Sets
- [ ] Authorization helpers (`has()`, `useAuth()`)
- [ ] Organization switcher component

### Phase 3: Webhooks & Real-time Sync (Week 3)
- [ ] Webhook endpoint with Svix verification
- [ ] Event emission for all user/org/session changes
- [ ] Webhook retry with exponential backoff

### Phase 4: Enterprise Features (Week 4)
- [ ] Verified domains (DNS TXT verification)
- [ ] Enterprise SSO (SAML/OIDC) - placeholder for future
- [ ] Custom session claims configuration
- [ ] Inactivity timeout, session limits

### Phase 5: UI Components & DX (Week 5)
- [ ] Drop-in auth components (SignIn, SignUp, UserButton)
- [ ] OrganizationSwitcher, OrganizationProfile
- [ ] AuthGuard for route protection
- [ ] TypeScript types matching Clerk SDK

### Phase 6: Polish & Migration (Week 6)
- [ ] Comprehensive test coverage
- [ ] Documentation & migration guide
- [ ] Performance optimization (Redis for session cache)
- [ ] Security audit

## Consequences

**Positive:**
- Production-grade multi-tenant auth matching Clerk capabilities
- Flexible RBAC supports any business model
- Self-hosted on Vercel + Supabase (cost control)
- Full data ownership and customization
- Clerk-compatible webhook payloads for easy migration

**Negative:**
- Significant development effort (6+ weeks)
- Ongoing maintenance of auth infrastructure
- Need to handle email/SMS delivery (use Resend/SendGrid + Twilio)
- Responsibility for security patches and compliance

**Risks:**
- Session management complexity (mitigate with thorough testing)
- Webhook reliability (mitigate with retry + dead letter queue)
- RBAC performance at scale (mitigate with caching + database indexes)

## Migration Path from Current RetailPass

1. Keep existing API contracts during transition
2. Add new models alongside existing ones
3. Migrate users with organization membership (create default org per user)
4. Replace fixed role checks with flexible `has()` checks
5. Deploy incrementally with feature flags

## Success Criteria

- [ ] All current RetailPass features work identically
- [ ] Multi-org support with switching
- [ ] Custom roles/permissions per org
- [ ] Webhook events match Clerk payload format
- [ ] Session refresh works seamlessly (no user-facing logout)
- [ ] Remote sign-out works across devices
- [ ] 0 vulnerabilities, 0 warnings, 0 errors
- [ ] Integration tests cover all auth flows