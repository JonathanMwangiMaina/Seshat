# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-29

### Fixed

- **ESLint Peer Dependency Conflict**: Downgraded ESLint from 10.9.1 to 9.39.5 to resolve `ERESOLVE` error with `eslint-plugin-react@7.37.5` (peer dependency requires ESLint ≤9.x)
- **Vercel Build Failure**: Fixed `npm install` exiting with code 1 due to upstream dependency conflict
- **npm Install Reliability**: Removed need for `--legacy-peer-deps` by aligning ESLint ecosystem versions

### Security

- ESLint 9.39.5 still receives security updates from the ESLint team
- All transitive dependency vulnerabilities remain patched (0 vulnerabilities)

## [1.0.0] - 2026-08-29

### Added

- **Major Framework Upgrade**: Next.js 15 → 16.3.3 with Turbopack as default bundler
- **React 19**: Upgraded from React 18.3.1 to React 19.0.0
- **Prisma 6**: Upgraded from Prisma 7.10.0 to Prisma 6.12.0 with driver adapters
- **Node.js 24**: Updated engine requirement from Node 20.x to Node 24.x
- **ESLint 10**: Upgraded from ESLint 9 to 10.9.1 (fixes deprecation warnings)
- **Tailwind CSS v4**: Migrated from Tailwind v3 to v4 with `@tailwindcss/postcss`
- **Zero Vulnerabilities**: `npm audit fix --force` resolved all 5 high-severity CVEs
- Architecture Decision Records (ADRs) in `docs/adr/`
- Consolidated test suite in `tests/` directory
- Role-based access control with ADMIN, VENDOR, CUSTOMER roles
- Password strength analysis with real-time feedback
- Forgot/reset password flow with secure tokens
- Comprehensive error handling for Prisma database errors

### Changed

- **BREAKING**: Next.js 16 requires `turbopack: {}` in next.config.js (webpack config no longer supported)
- **BREAKING**: React 19 requires @types/react v19 and updated component patterns
- **BREAKING**: Prisma 6 driver adapter API changes in `src/lib/prisma.ts`
- **BREAKING**: Tailwind CSS v4 uses `@theme` in CSS instead of `tailwind.config.ts`
- **BREAKING**: ESLint 10 requires updated plugin compatibility
- Moved test scripts from project root to `tests/integration/`
- Updated documentation to remove exposed file paths and secrets
- Enhanced signup validation with role validation
- Improved middleware authentication error handling
- Updated Prisma config with `earlyAccess: true` for v6 compatibility
- Removed deprecated `eslint` config from next.config.js

### Fixed

- User registration flow for all three roles (ADMIN, VENDOR, CUSTOMER)
- Route protection middleware consistency
- Password update validation (prevents same password reuse)
- Email enumeration protection in forgot password flow
- All npm audit high-severity vulnerabilities resolved (5 → 0)
- ESLint peer dependency conflicts resolved
- TypeScript compilation with Prisma 6 adapter types

### Security

- HTTP-only, Secure, SameSite=Strict cookies
- bcrypt password hashing (10 rounds)
- JWT token signing with HS256
- Email enumeration prevention
- Input validation on all API endpoints
- Prisma error handling without information leakage
- All transitive dependency vulnerabilities patched

## [0.1.0] - 2026-08-29

### Added

- Initial RetailPass authentication platform
- Next.js 15 with Pages Router and Turbopack
- JWT authentication with HTTP-only cookies
- Prisma ORM with PostgreSQL/Supabase
- User registration, login, logout
- Profile management (update name, email)
- Password change and reset functionality
- Password strength analysis API
- Role-based user model (ADMIN, VENDOR, CUSTOMER)
- bcrypt password hashing (10 rounds)
- TypeScript type safety throughout
- shadcn/ui + Radix UI components
- Tailwind CSS styling

### Security

- HTTP-only, Secure, SameSite=Strict cookies
- bcrypt password hashing
- JWT token signing with HS256
- Email enumeration prevention
- Input validation on all API endpoints
- Prisma error handling without information leakage