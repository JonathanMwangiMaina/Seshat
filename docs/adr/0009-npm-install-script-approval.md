# 0009 - npm Install Script Approval for Supply Chain Security

## Status

Accepted

## Context

Vercel builds were showing `npm warn allow-scripts` warnings for packages with native install scripts:
- `@prisma/client@6.19.3` (postinstall)
- `@prisma/engines@6.12.0` (postinstall)
- `esbuild@0.28.2` (postinstall)
- `prisma@6.12.0` (preinstall)

These warnings indicate unverified install scripts running during `npm install`.

## Decision

Upgrade npm to 12.x and explicitly approve required install scripts using `npm approve-scripts`.

## Rationale

- npm 12 introduces `npm approve-scripts` for explicit install script approval
- Explicit approval is more secure than blanket `allow-scripts=true` in .npmrc
- Eliminates warnings without suppression
- Follows npm supply chain security best practices
- No runtime behavior changes - only build-time verification

## Implementation

```bash
# Upgrade npm
npm install -g npm@12

# Explicitly approve each required package
npm approve-scripts @prisma/client @prisma/engines esbuild prisma
```

## Consequences

- Requires npm 12+ in CI/CD (Vercel supports this)
- Build process explicitly trusts only required packages
- No `.npmrc` suppression needed
- Build logs show clean install without warnings

## Security Benefits

- Explicit trust model vs implicit allow-all
- Audit trail of approved packages
- Reduces attack surface from supply chain compromise
- Aligns with SLSA supply chain security practices