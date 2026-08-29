# 0003 - JWT-Based Authentication with HTTP-Only Cookies

## Status

Accepted

## Context

RetailPass requires secure user authentication. Options evaluated:

- JWT in localStorage (vulnerable to XSS)
- JWT in HTTP-only cookies (secure against XSS)
- Session/cookie-based with server-side sessions
- NextAuth.js / Auth.js

## Decision

We will implement custom JWT authentication with tokens stored in HTTP-only, Secure, SameSite=Strict cookies.

## Rationale

- HTTP-only cookies prevent XSS token theft
- Secure flag ensures HTTPS-only transmission
- SameSite=Strict prevents CSRF attacks
- Stateless JWT avoids server-side session storage
- 7-day token expiry balances security and UX
- Custom implementation avoids vendor lock-in

## Implementation Details

- Token payload: `{ userId, email }`
- Signed with HS256 using `JWT_SECRET` env var
- Cookie name: `auth_token`
- Middleware in `src/lib/middleware.ts` validates tokens
- `authenticateRequest()` returns user or null
- `requireAuth()` returns 401 if not authenticated

## Consequences

- Must handle token refresh (currently fixed 7-day expiry)
- Logout requires cookie clearing
- No built-in refresh token rotation
- Secret rotation invalidates all sessions
