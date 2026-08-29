# 0007 - Testing Strategy: Consolidated Test Suite in tests/ Directory

## Status

Accepted

## Context

Test scripts were scattered across the project root as shell scripts and markdown files. Need a unified testing approach.

## Decision

We will consolidate all test scripts into a `tests/` directory with the following structure:

- `tests/integration/` - API integration tests (bash/curl)
- `tests/unit/` - Unit tests (Jest/Vitest)
- `tests/e2e/` - End-to-end tests (Playwright/Cypress)
- `tests/fixtures/` - Test data and helpers
- `tests/README.md` - Test running instructions

## Rationale

- Single location for all test artifacts
- Clear separation of test types
- Easier CI/CD integration
- Follows standard project conventions
- Shell scripts moved to integration tests
- Markdown test guides become documentation

## Consequences

- Existing root-level test scripts moved to `tests/integration/`
- New unit tests should use Vitest (compatible with Next.js)
- E2E tests can be added when UI stabilizes
- CI pipeline should run tests from `tests/`
