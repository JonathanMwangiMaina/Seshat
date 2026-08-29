# 0004 - Prisma ORM with PostgreSQL/Supabase

## Status
Accepted

## Context
RetailPass needs a type-safe database layer. Options evaluated:
- Raw SQL with pg driver
- Prisma ORM
- Drizzle ORM
- TypeORM

## Decision
We will use Prisma ORM 7 with PostgreSQL via Supabase.

## Rationale
- Type-safe database queries with auto-generated types
- Prisma 7 supports PostgreSQL adapter for connection pooling
- Supabase provides managed PostgreSQL with connection pooling
- Migration system for schema evolution
- Excellent TypeScript integration
- Developer experience with Prisma Studio

## Implementation Details
- Schema in `prisma/schema.prisma`
- User model with roles: ADMIN, VENDOR, CUSTOMER
- Password stored as bcrypt hash (not plain text)
- Connection via `@prisma/adapter-pg` with pg pool
- Global singleton pattern for dev hot-reload

## Consequences
- Requires `prisma generate` after schema changes
- Migrations must be run in deployment
- Supabase connection string required for production
- Connection pooling limits concurrent connections