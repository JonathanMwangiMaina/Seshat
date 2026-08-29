# 0005 - Password Security with bcrypt and Algorithmic Strength Analysis

## Status

Accepted

## Context

RetailPass needs secure password storage and user-facing password strength feedback. Options evaluated:

- bcrypt only
- Argon2
- scrypt
- Client-side only validation

## Decision

We will use bcrypt (10 rounds) for server-side password hashing and a custom algorithmic strength analyzer for real-time client feedback.

## Rationale

- bcrypt is battle-tested, widely adopted, and available in all environments
- 10 rounds provides good security/performance balance
- Custom analyzer gives instant feedback without server round-trip
- Analyzer checks: length, character variety, common patterns
- No external password strength service dependency

## Implementation Details

- `hashPassword()` in `src/lib/password.ts` uses bcryptjs
- `comparePassword()` for login verification
- `analyzePasswordStrength()` in `src/lib/password-validator.ts`
- API endpoint `/api/analyze-password` for client integration
- Minimum 8 characters enforced server-side
- Strength levels: very weak, weak, moderate, strong, very strong

## Consequences

- bcrypt is synchronous-ish (blocking), but 10 rounds is fast enough
- Client-side analyzer is advisory only; server enforces minimum
- No protection against breached password databases (could add HaveIBeenPwned)
- Analyzer algorithm may need tuning over time
