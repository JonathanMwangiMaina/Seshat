# 0004 - Prisma ORM with PostgreSQL/Supabase

## Status

Accepted (Updated for Prisma 6)

## Context

RetailPass needs a type-safe database layer. Options evaluated:

- Raw SQL with pg driver
- Prisma ORM
- Drizzle ORM
- TypeORM

## Decision

We will use Prisma ORM 6 with PostgreSQL via Supabase using driver adapters.

## Rationale

- Type-safe database queries with auto-generated types
- Prisma 6 introduces driver adapters for flexible database connectivity
- `@prisma/adapter-pg` provides native node-postgres (pg) integration
- Supabase provides managed PostgreSQL with connection pooling (PgBouncer)
- Migration system for schema evolution
- Excellent TypeScript integration
- Developer experience with Prisma Studio
- Zero known vulnerabilities (Prisma 7 had CVEs in transitive dependencies)

## Implementation Details

- Schema in `prisma/schema.prisma` with `datasource db { provider = "postgresql" url = env("SUPABASE_DATABASE_URL") }`
- User model with roles: ADMIN, VENDOR, CUSTOMER
- Password stored as bcrypt hash (not plain text)
- Connection via `@prisma/adapter-pg` with pg pool (transaction pooler on port 6543)
- Prisma config with `earlyAccess: true` for driver adapter support
- Global singleton pattern for dev hot-reload in `src/lib/prisma.ts`
- Driver adapter instantiated as `new PrismaPg(pool)` and passed to `PrismaClient({ adapter })`

## Consequences

- Requires `prisma generate` after schema changes
- Migrations must be run in deployment (`prisma migrate deploy`)
- Supabase connection string required for production
- Connection pooling limits concurrent connections (max 20)
- Prisma 6 driver adapter API differs from v7 (adapter passed in constructor options)

## Migration Notes (v7 → v6)

- Updated `@prisma/client` and `prisma` to 6.12.0
- Updated `@prisma/adapter-pg` to 6.12.0
- Added `url = env("SUPABASE_DATABASE_URL")` to datasource in schema.prisma
- Added `earlyAccess: true` to prisma.config.ts
- Updated adapter instantiation in src/lib/prisma.ts
- Added @types/pg for type safety
