# Tests

This directory contains all test artifacts for RetailPass.

## Structure

```
tests/
├── integration/     # API integration tests (bash/curl scripts)
├── unit/            # Unit tests (Vitest)
├── e2e/             # End-to-end tests (Playwright)
├── fixtures/        # Test data and helpers
└── README.md        # This file
```

## Running Tests

### Integration Tests

Requires the development server running (`npm run dev`):

```bash
# Run complete user management flow
./tests/integration/test-complete-flow.sh

# Test forgot password flow
./tests/integration/test-forgot-password.sh

# Test password reset flow
./tests/integration/test-reset-auto.sh
```

### Unit Tests

```bash
# Run unit tests (when implemented)
npm run test:unit
```

### E2E Tests

```bash
# Run E2E tests (when implemented)
npm run test:e2e
```

## Test Credentials

The integration tests use these demo credentials:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@retailpass.com | AdminPass123! |
| VENDOR | vendor@retailpass.com | VendorPass123! |
| CUSTOMER | user@test.com | UserPass123! |

## Writing New Tests

### Integration Tests

Create `.sh` files in `tests/integration/` that:
- Use `curl` to test API endpoints
- Set `API_URL` variable (default: `http://localhost:9002`)
- Use `jq` for JSON parsing
- Output clear pass/fail messages

### Unit Tests

Create `.test.ts` files in `tests/unit/` using Vitest:
- Test pure functions in `src/lib/`
- Mock external dependencies (Prisma, JWT, bcrypt)
- Aim for >80% coverage on business logic

### E2E Tests

Create `.spec.ts` files in `tests/e2e/` using Playwright:
- Test critical user flows (signup, login, profile update)
- Run against staging/production URLs
- Use test credentials from fixtures

## Fixtures

`tests/fixtures/` contains:
- Test user data
- Mock API responses
- Helper functions for test setup/teardown

## CI/CD

Tests run in GitHub Actions:
1. Unit tests on every push
2. Integration tests on PR to main
3. E2E tests on deployment to staging