# 0002 - Use Next.js Pages Router for Full-Stack Application

## Status
Accepted

## Context
RetailPass needs a full-stack React framework that supports both frontend and backend API routes. The team evaluated Next.js App Router vs Pages Router.

## Decision
We will use Next.js 15 with the Pages Router for the RetailPass application.

## Rationale
- Pages Router provides stable, well-documented API routes pattern
- Server-side rendering works reliably for authentication flows
- Middleware support for route protection
- Turbopack support in Next.js 15 for fast development builds
- Team familiarity with Pages Router patterns

## Consequences
- API routes live in `pages/api/`
- Authentication pages in `pages/*.tsx`
- Migration to App Router may be considered in future
- No React Server Components (uses traditional SSR)