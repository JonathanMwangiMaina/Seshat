# Clerk Clone Transformation: Weeks 1-3 Implementation Plan

## Phase 1: Core Data Model & Sessions (Week 1)

### Priority: CRITICAL - Foundation for all subsequent work

#### 1.1 Prisma Schema & Migration (Day 1-2)
- [ ] **Add new Prisma models** to `prisma/schema.prisma`:
  - `Organization`, `OrganizationMembership`, `Role`, `Permission`, `RoleSet`, `VerifiedDomain`
  - `Session`, `Client` (replace current simple session model)
  - Update `User` model with new relations
  - Add enums: `VerificationStatus`, `SessionStatus`
- [ ] **Create migration**: `npx prisma migrate dev --name add_organizations_rbac`
- [ ] **Seed system roles/permissions**: Create default `org:admin`, `org:member` roles with permissions
- [ ] **Create default RoleSet**: "default" with system roles
- [ ] **Verify migration** applies cleanly to local Supabase

#### 1.2 Hybrid Session Model Implementation (Day 2-3)
- [ ] **Create `SessionService`** (`src/lib/session.ts`):
  - `createClientToken(userId, deviceInfo)` → returns client token, stores in `Client` table
  - `createSessionToken(clientId, orgId, role, permissions)` → returns short-lived JWT (60s)
  - `validateClientToken(token)` → validates against `Client` table
  - `revokeClientToken(token)` → marks client as revoked
  - `revokeAllClientTokens(userId)` → remote sign-out
- [ ] **Update `src/lib/auth.ts`**:
  - Replace single JWT with dual-token approach
  - `signSessionToken(payload)` - 60s expiry
  - `signClientToken(payload)` - 30d expiry
  - `verifySessionToken(token)`, `verifyClientToken(token)`
- [ ] **Cookie configuration**:
  - `__client`: HttpOnly, Secure, SameSite=Lax, 30d
  - `__session`: HttpOnly, Secure, SameSite=Strict, 60s

#### 1.3 Token Refresh Endpoint (Day 3-4)
- [ ] **Create `POST /api/auth/refresh`**:
  - Reads `__client` cookie
  - Validates client token in DB
  - Extracts active organization context
  - Generates new session token with org claims
  - Returns `{ sessionToken }` and sets `__session` cookie
- [ ] **Client-side refresh logic** (`src/hooks/useAuth.ts`):
  - Auto-refresh every 50 seconds via `setInterval`
  - Handle 401 from API → trigger refresh → retry
  - Graceful logout if refresh fails

#### 1.4 Session/Device Management API (Day 4-5)
- [ ] **`GET /api/auth/sessions`** - List active sessions/devices for current user
- [ ] **`DELETE /api/auth/sessions/:id`** - Revoke specific session
- [ ] **`DELETE /api/auth/sessions`** - Revoke all sessions (remote sign-out)
- [ ] **Update `src/lib/middleware.ts`** to validate session token with org claims

#### 1.5 User Migration & Default Org (Day 5)
- [ ] **Migration script** to create default organization for existing users:
  - One org per user: `${email}'s Organization`
  - Add user as `org:admin` member
  - Assign default RoleSet
- [ ] **Update seed script** to create org structure for demo users
- [ ] **Verify all existing tests pass** with new schema

---

## Phase 2: Organizations & RBAC (Week 2)

### Priority: HIGH - Core multi-tenant functionality

#### 2.1 Organization CRUD API (Day 1-2)
- [ ] **`POST /api/organizations`** - Create organization (slug auto-generated from name)
- [ ] **`GET /api/organizations`** - List user's organizations (with role)
- [ ] **`GET /api/organizations/:id`** - Get organization details
- [ ] **`PATCH /api/organizations/:id`** - Update name, image, metadata
- [ ] **`DELETE /api/organizations/:id`** - Delete (with membership check)
- [ ] **Authorization**: Only `org:admin` can update/delete

#### 2.2 Membership Management (Day 2-3)
- [ ] **`POST /api/organizations/:id/members`** - Invite member by email + role
- [ ] **`GET /api/organizations/:id/members`** - List members with roles
- [ ] **`PATCH /api/organizations/:id/members/:userId`** - Update role/metadata
- [ ] **`DELETE /api/organizations/:id/members/:userId`** - Remove member
- [ ] **`POST /api/organizations/:id/invitations`** - Create invitation token
- [ ] **`POST /api/organizations/invitations/accept`** - Accept invitation

#### 2.3 Role/Permission System (Day 3-4)
- [ ] **`GET /api/organizations/:id/roles`** - List available roles (from RoleSet)
- [ ] **`POST /api/organizations/:id/roles`** - Create custom role
- [ ] **`PATCH /api/organizations/:id/roles/:roleId`** - Update role permissions
- [ ] **`DELETE /api/organizations/:id/roles/:roleId`** - Delete custom role
- [ ] **`GET /api/organizations/:id/permissions`** - List all available permissions
- [ ] **RoleSet API**: `GET/POST/PATCH /api/organizations/:id/role-sets`

#### 2.4 Authorization Helpers (Day 4)
- [ ] **Backend `auth()` function** (`src/lib/authz.ts`):
  - Returns `{ userId, orgId, orgRole, orgPermissions, has() }`
  - `has({ role })`, `has({ permission })`, `has({ allPermissions: [] })`
- [ ] **Frontend `useAuth()` hook enhancement**:
  - Add `has()` method for component-level checks
  - Add `organization` object to context
- [ ] **Middleware wrapper** `requireAuth(options)`:
  - `requireAuth({ role: 'org:admin' })`
  - `requireAuth({ permission: 'org:billing:manage' })`

#### 2.5 Organization Switcher Component (Day 5)
- [ ] **`<OrganizationSwitcher />`** component:
  - Dropdown with user's organizations
  - Shows current org with badge
  - Calls `POST /api/organizations/switch` on select
  - Updates session token via refresh
- [ ] **`useOrganization()` hook** - Access active org, switch function
- [ ] **Header integration** - Add to existing layout

---

## Phase 3: Webhooks & Real-time Sync (Week 3)

### Priority: HIGH - External integrations & data consistency

#### 3.1 Webhook Infrastructure (Day 1-2)
- [ ] **`POST /api/webhooks/clerk`** endpoint:
  - Verify Svix signature (using `svix` package)
  - Parse event type and payload
  - Idempotency key handling (prevent duplicate processing)
  - Return 200 within 500ms (async processing)
- [ ] **Webhook queue** (simple in-memory or Redis):
  - Queue events for async processing
  - Retry with exponential backoff (1s, 2s, 4s, 8s, max 5 retries)
  - Dead letter queue for failed events after max retries
- [ ] **Event types to handle**:
  - `user.created`, `user.updated`, `user.deleted`
  - `session.created`, `session.revoked`, `session.ended`
  - `organization.created`, `organization.updated`, `organization.deleted`
  - `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted`
  - `organizationInvitation.created`, `organizationInvitation.accepted`, `organizationInvitation.revoked`

#### 3.2 Event Emission (Day 2-3)
- [ ] **Create `EventEmitter` service** (`src/lib/events.ts`):
  - `emit(eventType, payload)` - pushes to webhook queue
  - Clerk-compatible payload format
  - Include `object`, `previous_attributes`, `data`
- [ ] **Integrate event emission** into all mutating operations:
  - User: signup, profile update, delete
  - Session: create, revoke, end
  - Organization: create, update, delete
  - Membership: create, update, delete
  - Invitation: create, accept, revoke

#### 3.3 Webhook Configuration & Management (Day 3-4)
- [ ] **`POST /api/organizations/:id/webhooks`** - Register webhook endpoint
- [ ] **`GET /api/organizations/:id/webhooks`** - List webhooks
- [ ] **`DELETE /api/organizations/:id/webhooks/:webhookId`** - Delete webhook
- [ ] **`POST /api/organizations/:id/webhooks/:webhookId/test`** - Send test event
- [ ] **Webhook secret rotation** support

#### 3.4 Testing & Reliability (Day 4-5)
- [ ] **Unit tests** for webhook signature verification
- [ ] **Integration tests** for event emission on all operations
- [ ] **Load test** webhook endpoint (100 req/s)
- [ ] **Monitoring**: Log webhook success/failure rates
- [ ] **Documentation**: Webhook payload examples for each event type

---

## Cross-Cutting Concerns (All Weeks)

### Testing (Daily)
- [ ] Unit tests for each new service/module (>80% coverage)
- [ ] Integration tests for each API endpoint
- [ ] E2E tests for critical flows (Playwright)

### Code Quality (Daily)
- [ ] Run `npm run lint`, `npm run typecheck`, `npm run build` before each commit
- [ ] Maintain 0 vulnerabilities, 0 warnings, 0 errors
- [ ] Update ADRs for any architectural decisions

### Documentation (End of each week)
- [ ] Update `CHANGELOG.md` with weekly progress
- [ ] Document new API endpoints in `docs/`
- [ ] Update README with new features

---

## Dependencies & Prerequisites

| Task | Depends On |
|------|------------|
| 1.2 Hybrid Sessions | 1.1 Schema |
| 1.3 Token Refresh | 1.2 Session Service |
| 1.4 Session API | 1.2 Session Service |
| 2.1 Org CRUD | 1.1 Schema, 1.5 Migration |
| 2.2 Membership | 2.1 Org CRUD |
| 2.3 Roles/Perms | 2.1 Org CRUD |
| 2.4 Auth Helpers | 1.3 Token Refresh, 2.3 Roles |
| 2.5 Switcher | 2.4 Auth Helpers |
| 3.1 Webhooks | 3.2 Event Emission |
| 3.2 Events | 1.1 Schema, 2.1-2.3 APIs |
| 3.3 Webhook Mgmt | 3.1 Webhooks |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Session complexity | Comprehensive test suite; gradual rollout with feature flags |
| Webhook reliability | Exponential backoff + dead letter queue; monitoring alerts |
| RBAC performance | Database indexes on membership/role lookups; Redis caching (Week 6) |
| Migration data loss | Backup before migration; test migration on staging first |

---

## Week 1 Definition of Done
- [ ] All new Prisma models deployed to Supabase
- [ ] Hybrid sessions working (login → client+session tokens → refresh)
- [ ] Token refresh every 50s in browser
- [ ] Session management API functional
- [ ] Existing users migrated with default orgs
- [ ] All existing tests pass
- [ ] 0 vulnerabilities, 0 warnings, 0 errors

## Week 2 Definition of Done
- [ ] Full organization CRUD + membership management
- [ ] Role/permission system with RoleSets
- [ ] `has()` authorization working on frontend & backend
- [ ] Organization switcher in header
- [ ] Multi-org login flows tested
- [ ] 0 vulnerabilities, 0 warnings, 0 errors

## Week 3 Definition of Done
- [ ] Webhook endpoint with Svix verification
- [ ] All core events emitted on mutations
- [ ] Retry logic with exponential backoff
- [ ] Webhook management API (CRUD + test)
- [ ] Clerk-compatible payload format verified
- [ ] 0 vulnerabilities, 0 warnings, 0 errors