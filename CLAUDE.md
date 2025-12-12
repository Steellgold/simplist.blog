# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a headless CMS and content analytics platform for blogs and technical documentation. It's a multi-tenant SaaS application where users manage multiple projects, publish articles via an API-first architecture, and track analytics.

## Monorepo Structure

This is a pnpm workspace managed by Turbo with 4 main applications:

- **apps/app** (port 3000): Main SaaS dashboard for project management, article editing, analytics, and billing
- **apps/web** (port 3001): Marketing/landing page website
- **apps/api** (port 4000): Fastify REST API serving articles, analytics, and SEO metadata
- **apps/docs** (port 3002): Documentation site built with Next.js + MDX

Shared packages:
- **packages/db**: Prisma ORM with PostgreSQL schema and migrations
- **packages/ui**: Shared React components (Radix UI + shadcn/ui)
- **packages/sdk**: Published TypeScript SDK for external integrations
- **packages/limits**: Quota limit constants
- **packages/eslint-config** and **packages/typescript-config**: Shared configs

## Common Commands

### Development
```bash
# Start all apps in dev mode
pnpm dev

# Start specific app
pnpm --filter @simplist/web run dev
pnpm --filter @simplist/api run dev
pnpm --filter @simplist/docs run dev

# Start app (dashboard) - uses HTTPS by default on port 3000
cd apps/app && pnpm dev

# API development with watch mode
pnpm api:dev
```

### Database
```bash
# Push schema changes to database (development)
pnpm db:push

# Create and apply migrations (production-ready)
pnpm db:migrate

# Deploy migrations (production)
pnpm db:deploy

# Open Prisma Studio (database GUI)
pnpm db:studio

# Regenerate Prisma client
pnpm db:build
```

### Build & Lint
```bash
# Build all packages
pnpm build

# Build API and dependencies
pnpm api:build

# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Testing
```bash
# Run tests for API
cd apps/api && pnpm test
```

## Architecture & Key Patterns

### Authentication
- Uses Better-Auth v1.4.6 with Prisma adapter
- Supports email/password, GitHub OAuth, Google OAuth, passkeys (WebAuthn), and 2FA (TOTP)
- Email verification and password reset via AWS SES
- Configuration in `apps/app/lib/auth.tsx`

### Database Schema (Prisma)
Located in `packages/db/prisma/schema.prisma`:
- **Multi-tenant**: Users own Projects, each with own articles, tags, API keys, members
- **Articles**: Support multi-language variants (ArticleVariant), tags, scheduled publishing, view tracking
- **Analytics**: PageView and PageEvent models track visitor data (anonymized IP, geolocation, device, UTM parameters)
- **RBAC**: Project members have customizable roles with permission arrays
- **API Keys**: Project-scoped with quota limits (1,000 for STARTER, 500,000 for PRO)
- **Subscriptions**: Stripe integration with STARTER/PRO tiers

### API Architecture
- Fastify-based REST API with `/v1` prefix
- Authentication via `x-api-key` header (not JWT)
- Rate limiting and CORS configured
- Quota tracking with monthly reset (30-day window)
- Redis caching (Upstash) for API keys and analytics queries

### Frontend Stack
- Next.js 16 with React 19
- Tailwind CSS 4.1.17 for styling
- shadcn/ui components (Radix UI primitives)
- React Hook Form + Zod for form validation
- TanStack React Table for data tables
- Recharts for analytics visualization

### File Storage
- Cloudflare R2 (S3-compatible) for images and avatars
- Configuration via R2_* environment variables

### Background Jobs
- Cron library used for scheduled article publishing
- Monthly API quota resets

## Environment Variables

Required variables are defined in `.env.example`:
- Database: `DATABASE_URL`
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, OAuth credentials
- Storage: R2 credentials (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, etc.)
- Email: AWS SES credentials (`AWS_ACCESS_KEY_ID`, `SES_FROM_EMAIL`)
- Cache: Upstash Redis credentials
- Payments: Stripe keys and webhook secret

## Adding shadcn/ui Components

Run from repository root:
```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This places components in `packages/ui/src/components`.

Import components:
```tsx
import { Button } from "@simplist/ui/components/button"
```

## Testing Conventions

Tests are located in `apps/api` and use Vitest. Run with `pnpm test` in the api directory.

## Important Notes

- The main dashboard (`apps/app`) runs on HTTPS by default in development (port 3000)
- API authentication is header-based (`x-api-key`), not token-based
- All database changes should go through Prisma migrations, not direct schema edits
- The SDK package is published to npm as `@simplist.blog/sdk`
- TypeScript 5.9.3 is used across the entire monorepo with strict mode enabled
