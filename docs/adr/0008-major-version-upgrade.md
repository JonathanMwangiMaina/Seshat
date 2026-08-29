# 0008 - Major Version Upgrade: Next.js 16, React 19, Prisma 6, Node 24

## Status

Accepted

## Context

RetailPass v0.1.0 was built on Next.js 15, React 18, Prisma 7, Node 20. Major framework versions have been released with significant improvements and security fixes.

## Decision

Upgrade to:

- Next.js 15 → 16.3.3
- React 18 → 19.0.0
- Prisma 7 → 6.12.0
- Node.js 20 → 24.x
- ESLint 9 → 10.9.1
- Tailwind CSS 3 → 4

## Rationale

### Next.js 16

- Turbopack is now the default bundler (no config needed for basic usage)
- React 19 support with new concurrent features
- Improved build performance and developer experience
- Removed deprecated `eslint` config from next.config.js

### React 19

- New hooks: `useActionState`, `useFormStatus`, `useOptimistic`
- Improved concurrent rendering
- Better Server Components support
- Compiler optimizations

### Prisma 6

- Driver adapter pattern for flexible database connectivity
- Zero known vulnerabilities (Prisma 7 had 5 high-severity CVEs in transitive deps)
- Better performance with query engine improvements
- Early access driver adapter support

### Node.js 24

- LTS release with long-term support
- Improved performance and security
- Required by Vercel (Node 20 deprecated Oct 2026)

### ESLint 10

- Fixes deprecated ESLint 9 warning
- Better TypeScript integration with typescript-eslint 8

### Tailwind CSS v4

- New `@theme` syntax in CSS (replaces tailwind.config.ts)
- `@tailwindcss/postcss` plugin for PostCSS integration
- Better performance and smaller bundle size

## Breaking Changes

| Package  | From   | To     | Migration Notes                                                |
| -------- | ------ | ------ | -------------------------------------------------------------- |
| Next.js  | 15.5.x | 16.3.3 | Add `turbopack: {}`, remove `eslint` config, update dev script |
| React    | 18.3.x | 19.0.0 | Update @types/react v19, update component patterns             |
| Prisma   | 7.10.x | 6.12.0 | Driver adapter API, earlyAccess config, datasource url         |
| Node.js  | 20.x   | 24.x   | Update engines in package.json, install nvm                    |
| ESLint   | 9.39.x | 10.9.1 | Update plugins, fix peer deps                                  |
| Tailwind | 3.4.x  | 4.3.x  | Replace tailwind.config.ts with @theme in CSS                  |

## Migration Checklist

- [x] Update package.json dependencies and engines
- [x] Update next.config.js (remove eslint, add turbopack)
- [x] Update prisma/schema.prisma (add datasource url)
- [x] Update prisma.config.ts (add earlyAccess: true)
- [x] Update src/lib/prisma.ts (Prisma 6 driver adapter API)
- [x] Update postcss.config.mjs (@tailwindcss/postcss)
- [x] Update styles/globals.css (@theme syntax)
- [x] Remove tailwind.config.ts
- [x] Update @types/react, @types/react-dom to v19
- [x] Update @types/node to v26
- [x] Add @types/pg for type safety
- [x] Run npm audit fix --force (resolve all vulnerabilities)
- [x] Run build, lint, typecheck - all pass
- [x] Run integration tests - all 29 pass

## Consequences

- Major version bump: 0.1.0 → 1.0.0 (SemVer breaking changes)
- All npm audit vulnerabilities resolved (5 high → 0)
- Build, lint, typecheck, audit all pass with 0 errors/warnings
- Integration tests pass (29/29)
- Ready for Vercel deployment on Node 24.x

## Rollback Plan

If critical issues arise:

1. Revert package.json to previous versions
2. Revert next.config.js, prisma configs

- Revert globals.css to Tailwind v3 syntax
- Revert src/lib/prisma.ts to v7 adapter pattern
- Run `npm install` and `npm run build`
