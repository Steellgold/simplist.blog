ji# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a multi-tenant blogging platform with analytics capabilities. It's a pnpm monorepo using Turborepo with three main applications and several shared packages.

## Monorepo Structure

- **apps/api**: Fastify REST API backend (port 4000)
- **apps/app**: Next.js main application with authentication, project management, article editing, and analytics (port 3000)
- **apps/web**: Next.js marketing website (port 3001)
- **packages/db**: Prisma database schema and client
- **packages/sdk**: TypeScript SDK for the API (published to npm as @simplist.blog/sdk)
- **packages/ui**: Shared UI components (shadcn/ui based)
- **packages/eslint-config**: Shared ESLint configuration
- **packages/typescript-config**: Shared TypeScript configuration

## Development Commands

### Running the Project
```bash
# Run all apps in development mode
pnpm dev

# Run specific apps
pnpm api:dev     # API only (Fastify with tsx watch)
pnpm --filter @simplist/app dev  # Main app (Next.js with HTTPS on port 3000)
pnpm --filter @simplist/web dev  # Marketing site (Next.js with HTTPS on port 3001)
```

### Building
```bash
# Build all apps
pnpm build

# Build API and dependencies
pnpm api:build

# Build specific apps
pnpm --filter @simplist/app build
pnpm --filter @simplist/web build
```

### Database Operations
```bash
# Push schema changes to database
pnpm db:push

# Create a migration
pnpm db:migrate

# Deploy migrations (production)
pnpm db:deploy

# Open Prisma Studio
pnpm db:studio

# Build database package (generates Prisma client)
pnpm db:build
```

### Linting and Formatting
```bash
# Lint all packages
pnpm lint

# Format code
pnpm format
```

### SDK Development
```bash
# Build SDK
pnpm --filter @simplist.blog/sdk build

# Watch SDK for changes
pnpm --filter @simplist.blog/sdk dev

# Type check SDK
pnpm --filter @simplist.blog/sdk type-check
```

## Architecture

### Authentication (apps/app)
- Uses **better-auth** with Prisma adapter
- Supports email/password, GitHub, and Google OAuth
- Multi-factor authentication via TOTP (2FA) and passkeys
- Custom email verification and password reset flows via AWS SES
- Session-based authentication stored in PostgreSQL

### Multi-tenancy Model
- Users can own multiple **Projects**
- Each Project has its own:
  - Subscription tier (STARTER or PRO)
  - API keys (secret/public with permissions)
  - Articles with multi-language variants
  - Analytics data (PageViews, PageEvents)
  - CORS allowed origins
  - Storage and API usage quotas

### API Architecture (apps/api)
- Fastify-based REST API with plugin architecture
- Plugins in `apps/api/src/plugins/`: auth, CORS, compression, helmet, rate limiting
- Routes in `apps/api/src/routes/`: articles, projects, analytics, SEO, cron
- All routes prefixed with `/v1`
- Health check at `/health`
- Uses Zod schemas for validation (in `apps/api/src/schemas/`)
- Bot detection utility for analytics filtering

### Database Schema
- PostgreSQL with Prisma ORM
- Client generated to `packages/db/generated/client`
- Project-based resource isolation (all content belongs to a Project)
- **Articles** support multi-language variants (ArticleVariant model)
- Analytics stored in **PageView** (full page analytics) and **PageEvent** (interaction events)
- Subscription tracking at Project level with Stripe integration

### File Storage
- Uses Cloudflare R2 (S3-compatible) for article images and project icons
- Presigned URLs for uploads
- Storage quota tracking per project

### Shared UI Components (packages/ui)
- Based on shadcn/ui
- Add components: `pnpm dlx shadcn@latest add <component> -c apps/web`
- Components placed in `packages/ui/src/components`
- Import via `@simplist/ui/components/<component>`

### Frontend Structure (apps/app)
- Next.js 16 with App Router
- Dynamic routes: `[project-slug]` for project-specific pages
- Server actions in `lib/actions/`: api-keys, articles, projects, analytics, dashboard
- Validations in `lib/validations/` using Zod
- Auth helpers in `lib/auth-client.ts` and `lib/auth-helper.ts`
- Stripe integration in `lib/stripe/`
- Subscription quota checking in `lib/subscription/quota-check.ts`

### SDK (packages/sdk)
- Published npm package for API consumption
- Resources: articles, projects, analytics, SEO
- Variant helpers for multi-language support
- Built with Rollup (CJS + ESM outputs)

## Important Patterns

### API Key Authentication
- Two types: secret keys (`sk_`) and public keys (`pk_`)
- Permissions: `read`, `analytics`
- Validated in API via `apps/api/src/plugins/auth.ts`
- Analytics requests can come from SDK or direct web interface (tracked via `requestSource`)

### Analytics Flow
1. PageView created on article load (visitor/session IDs hashed)
2. PageEvents track interactions (scroll milestones, clicks)
3. Bot detection filters automated traffic
4. Analytics aggregated by project/article with geographic and device data

### Subscription Tiers
- **STARTER**: Limited projects, articles, API calls, storage
- **PRO**: Increased limits, custom cover images per variant, advanced analytics
- Limits defined in `apps/app/lib/subscription/plans.ts`
- Quota checks in `apps/app/lib/subscription/quota-check.ts`
- Stripe webhook handling in `apps/app/app/api/webhooks/stripe/route.ts`

### Scheduled Publishing
- Articles have `scheduledPublishAt` field
- Cron jobs in `apps/api/src/services/scheduler.ts` handle publishing
- Uses timezone from Project settings

## Environment Variables

Key environment variables (see turbo.json for full list):
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Auth encryption secret
- `BETTER_AUTH_URL`: Auth callback URL
- OAuth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`
- Redis: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
- SES: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SES_FROM_EMAIL`

## Testing

```bash
# Run API tests
pnpm --filter @simplist/api test

# Run SDK tests
pnpm --filter @simplist.blog/sdk test
```

## Package Manager

Uses pnpm (version 10.4.1) with workspace protocol for internal dependencies. Node.js >=20 required.
