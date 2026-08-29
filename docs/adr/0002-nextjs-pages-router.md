# 0002 - Use Next.js Pages Router for Full-Stack Application

## Status

Accepted (Updated for Next.js 16)

## Context

RetailPass needs a full-stack React framework that supports both frontend and backend API routes. The team evaluated Next.js App Router vs Pages Router.

## Decision

We will use Next.js 16 with the Pages Router for the RetailPass application.

## Rationale

- Pages Router provides stable, well-documented API routes pattern
- Server-side rendering works reliably for authentication flows
- Middleware support for route protection
- Turbopack is now the default bundler in Next.js 16 (no configuration needed)
- Team familiarity with Pages Router patterns
- App Router migration path available but not required for current scope

## Consequences

- API routes live in `pages/api/`
- Authentication pages in `pages/*.tsx`
- Migration to App Router may be considered in future
- No React Server Components (uses traditional SSR)
- Next.js 16 requires `turbopack: {}` in next.config.js for explicit Turbopack config
- React 19 with new concurrent features available