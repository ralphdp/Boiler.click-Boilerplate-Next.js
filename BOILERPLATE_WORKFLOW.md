# ARCHITECTURAL SUBSTRATE | WORKFLOW PROTOCOLS

This document defines the official protocols for initializing new nodes and maintaining the substrate through its evolutionary lifecycle.

## 1. INITIALIZATION (BOOTSTRAP)
To instantiate a new site from this substrate, execute the Vanguard Handshake:

```bash
npm run bootstrap
```
This will:
- Generate a fresh `.env.local`
- Create unique cryptographic vectors (`NEXTAUTH_SECRET`, `SOVEREIGN_CIPHER`)
- Brand the project with your specific identity shards.

## 2. MAINTENANCE & UPDATES (THE UPSTREAM MERGE)
The substrate is designed for a **one-to-many evolution**. As we push updates to the Core Boilerplate, you should pull those changes into your active projects.

### Step A: Link to the Origin
(Perform this once per project):
```bash
git remote add origin https://github.com/ralphdp/Boiler.click-Boilerplate-Next.js
```

### Step B: Sync the Substrate
When an update is announced:
```bash
git fetch origin
git merge origin/main --allow-unrelated-histories
```

### Conflict Strategy:
- **`src/core/`**: Always prefer 'Theirs' (Origin) unless you have made critical substrate modifications.
- **`src/app/`**: Always prefer 'Yours' (Local) as this is where your project-specific logic resides.
- **`src/theme/config.ts`**: Resolve manually to maintain your specific branding.

## 3. ARCHITECTURAL BOUNDARIES
To ensure seamless future updates, adhere to these strictures:
- **PROTECTED**: `src/core/*` and `src/components/ui/*`. Avoid unique project logic here.
- **VOLATILE**: `src/app/*` and `src/components/features/*`. Build your specific site logic here.
- **GATEWAY**: `src/core/config/defaults.ts`. This file governs fallback states; update it only if you want to change factory defaults globally.

---
**SUBSTRATE VERSION: 6.8.5.v6**
**PROTOCOLS MANDATED BY ETHOS**
