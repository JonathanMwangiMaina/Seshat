# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Architecture Decision Records (ADRs) in `docs/adr/`
- Consolidated test suite in `tests/` directory
- Role-based access control with ADMIN, VENDOR, CUSTOMER roles
- Password strength analysis with real-time feedback
- Forgot/reset password flow with secure tokens
- Comprehensive error handling for Prisma database errors

### Changed
- Moved test scripts from project root to `tests/integration/`
- Updated documentation to remove exposed file paths and secrets
- Enhanced signup validation with role validation
- Improved middleware authentication error handling

### Fixed
- User registration flow for all three roles (ADMIN, VENDOR, CUSTOMER)
- Route protection middleware consistency
- Password update validation (prevents same password reuse)
- Email enumeration protection in forgot password flow

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