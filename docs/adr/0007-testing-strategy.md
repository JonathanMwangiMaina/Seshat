# 0007 - Testing Strategy: Consolidated Test Suite in tests/ Directory

## Status

Accepted (Updated for Next.js 16 / React 19)

## Context

Test scripts were scattered across the project root as shell scripts and markdown files. Need a unified testing approach.

## Decision

We will consolidate all test scripts into a `tests/` directory with the following structure:

- `tests/integration/` - API integration tests (bash/curl)
- `tests/unit/` - Unit tests (Vitest)
- `tests/e2e/` - End-to-end tests (Playwright)
- `tests/fixtures/` - Test data and helpers
- `tests/README.md` - Test running instructions

## Rationale

- Single location for all test artifacts
- Clear separation of test types
- Easier CI/CD integration
- Follows standard project conventions
- Shell scripts moved to integration tests
- Markdown test guides become documentation

## Implementation Details

### Integration Tests (`tests/integration/`)

- `test-all-flows.sh` - Comprehensive API test suite covering:
  - Unauthorized access protection
  - Password strength analysis
  - Admin/VENDOR/CUSTOMER full authentication flows (signup, login, me, profile update, password update, logout)
  - Forgot password flow
  - Duplicate signup prevention
- Run with: `TEST_API_URL=http://localhost:9002 ./tests/integration/test-all-flows.sh`

### Unit Tests (`tests/unit/`)

- **Framework**: Vitest (compatible with Next.js 16, React 19, Vite-based)
- **Location**: `tests/unit/` for logic utilities (password-validator, auth, middleware)
- **Configuration**: `vitest.config.ts` with TypeScript support

### E2E Tests (`tests/e2e/`)

- **Framework**: Playwright (recommended for Next.js 16)
- **Location**: `tests/e2e/` for full user journey tests
- **Configuration**: `playwright.config.ts`

### Fixtures (`tests/fixtures/`)

- Shared test data, mock users, API response helpers

## Consequences

- Existing root-level test scripts moved to `tests/integration/`
- New unit tests should use Vitest (compatible with Next.js 16, React 19)
- E2E tests use Playwright for cross-browser testing
- CI pipeline should run tests from `tests/`
- Integration tests require running dev server (`npm run dev`)
- All 29 integration tests pass (admin, vendor, customer flows)

## Current Test Coverage

| Test Type | Status | Count |
|-----------|--------|-------|
| Integration | ✅ Passing | 29 tests |
| Unit | 📋 Planned | 0 |
| E2E | 📋 Planned | 0 |

## CI/CD Integration

```yaml
# Example GitHub Actions step
- name: Run Integration Tests
  run: |
    npm run dev &
    sleep 5
    TEST_API_URL=http://localhost:9002 ./tests/integration/test-all-flows.sh
```