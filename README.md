# BOILER™ | UNIVERSAL SUBSTRATE

This is a high-performance, universal Next.js substrate for sovereign architectural nodes.

## Repository
https://github.com/organization/Boiler.click-Boilerplate-Next.js

## Development
This is a Next.js 16 project optimized with Turbopack and Framer Motion.

```bash
npm run dev
```

### 🚨 Critical Requirement: Stripe Webhooks
If you clone this boilerplate or deploy to Vercel, you **MUST** ensure the following environment variables are assigned real values:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**If these values remain as placeholders, the Stripe API will crash with an HTTP 500 when interacting with subscription checkouts or portal interfaces.**

---
Powered by Boiler.click
