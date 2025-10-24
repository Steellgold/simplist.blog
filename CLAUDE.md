# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a simple blog management system built with Next.js 15, using the App Router with React Server Components. It's a **single-project-per-user** application where each authenticated user can create one blog project to manage articles and API keys.

The project now includes a **monorepo architecture** with:
- `packages/db/` - Shared Prisma schema and database client
- `packages/api/` - Public Fastify API for content consumption (api.simplist.blog)
- `packages/sdk/` - TypeScript SDK for NPM (@simplist.blog/sdk)
- Main Next.js app - Admin interface (simplist.blog)

## Development Commands

```bash
# Main Next.js app
pnpm run dev            # Development server (port 3000)
pnpm run build          # Build with Turbopack
pnpm run start          # Start production server
pnpm run lint           # Run ESLint

# Database operations (via shared package)
pnpm run db:migrate     # Run Prisma migrations (use after schema changes)
pnpm run db:push        # Push schema changes without migration (dev only)
pnpm run db:studio      # Open Prisma Studio

# API development
pnpm run api:dev        # Start Fastify API dev server (port 3001)
pnpm run api:build      # Build API
pnpm run api:start      # Start API production server

# SDK development
pnpm run sdk:dev        # SDK watch mode
pnpm run sdk:build      # Build SDK for NPM

# Build all packages
pnpm run build:packages # Build DB, API, and SDK packages
```

**Important**: After modifying `packages/db/prisma/schema.prisma`, always run `pnpm run db:migrate` to apply changes. The Article model includes statistics fields that must be migrated.

**Environment Setup**:
- Redis (required for both main app and API):
  - `UPSTASH_REDIS_REST_URL` - Upstash Redis REST endpoint
  - `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis authentication token
- Stripe (required for billing):
  - `STRIPE_SECRET_KEY` - Stripe API key
  - `STRIPE_PRICE_PRO_MONTHLY` - Stripe price ID for monthly Pro plan
  - `STRIPE_PRICE_PRO_YEARLY` - Stripe price ID for yearly Pro plan
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
  - `NEXT_PUBLIC_APP_URL` - App URL for Stripe redirects

## Architecture

### Authentication Flow

- Uses **Better Auth** (`lib/auth.ts`) with Prisma adapter
- Supports email/password and OAuth (Google, GitHub)
- Client-side auth via `authClient` from `lib/auth-client.ts`
- Server-side user retrieval via `getCurrentUser()` from `lib/auth-helper.ts`

### Database

- **PostgreSQL** with Prisma ORM
- **Upstash Redis** for API key caching shared across packages
- Shared database package in `packages/db/` with singleton pattern for both Prisma and Redis
- Schema includes: User, Session, Account, Verification, Project, ApiKey, Article, Asset, PageView, PageEvent
- Connection string: `postgresql://postgres:postgres@localhost:5432/simplist?schema=public`

**Key Model Updates**:
- **Project** model includes subscription fields:
  - `subscriptionTier` (STARTER | PRO) - Current subscription level
  - `subscriptionExpiresAt` - Expiration timestamp for subscription
  - `stripeCustomerId` - Stripe customer ID for billing
  - `stripeSubscriptionId` - Active Stripe subscription ID
  - `monthlyApiCalls` - Current month's API call count
  - `apiCallsResetAt` - Next reset date for API calls
  - `totalStorageUsed` - Total storage used in bytes (for image uploads)
- **ApiKey** model includes:
  - `permissions` array (read, analytics) for granular access control
  - `status` field for active/revoked state
  - `deletedAt` for soft deletion
- **Article** model includes:
  - `status` ("draft", "published", "deleted", "scheduled")
  - `scheduledPublishAt` for scheduled publishing (PRO feature)

### API Architecture

The public API (`packages/api/`) serves content consumption:
- **Fastify** server optimized for performance
- **API key authentication** using existing Simplist keys with Redis caching (5 min TTL)
- **Rate limiting** (100 requests/minute per API key)
- **CORS** configured for allowed domains
- **Swagger documentation** on `/docs`
- **Endpoints**: `/v1/articles`, `/v1/articles/:slug`, `/v1/project`

### SDK Package

The TypeScript SDK (`packages/sdk/`) provides:
- **Type-safe** client for the public API
- **Retry logic** with exponential backoff
- **Published on NPM** as `@simplist.blog/sdk`
- **ESM/CJS support** for maximum compatibility

### Route Structure

**Public routes** (no auth required):
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password recovery
- `/pricing` - Pricing page with plan comparison and upgrade flow
- `/home` - Landing page
- `/(legal)/*` - Legal pages (terms, privacy, GDPR)
- `/` - Root redirects to `/dashboard` or `/auth/login`

**Protected routes** (require auth, in `app/(dashboard)/` group):
- `/dashboard` - Main dashboard
- `/articles` - Article management (list view with data table)
- `/articles/new` - Article creation form (responsive 2-column layout on desktop)
- `/api-keys` - API key management
- `/analytics` - Analytics dashboard (shows activation UI if not enabled)
- `/[pslug]/settings` - Settings base page
- `/[pslug]/settings/billing` - Billing management (Stripe portal integration)

**Special route**:
- `/create-project` - First-time project creation (outside dashboard group, no sidebar)

**API routes**:
- `/api/webhooks/stripe` - Stripe webhook handler for subscription lifecycle events
- `/api/subscription/limits` - Get current subscription usage and limits
- `/api/projects` - List user projects with subscription info

**Responsive Layout Pattern**:
- Desktop: 3-column grid (`grid-cols-1 lg:grid-cols-3`)
  - Main content: `lg:col-span-2` (title, excerpt, content editor)
  - Sidebar: `lg:col-span-1` (status, image upload)
- Mobile: Single column stack
- Container max-width: `max-w-7xl` for article creation form

### Single Project Mode

The application enforces **one project per user**:
- `app/(dashboard)/layout.tsx` redirects to `/create-project` if no projects exist
- `app/create-project/page.tsx` redirects to `/dashboard` if a project already exists
- Server-side validation in `lib/actions/projects.ts` prevents multiple project creation
- Sidebar displays the single project info (name, slug) with PencilRuler icon

### Slug Generation

Project slugs are auto-generated from the project name:
- Accented characters are normalized: "Café" → "cafe"
- Spaces become hyphens: "My Blog" → "my-blog"
- Must be unique per user (same slug allowed across different users)
- If conflict exists, appends `-1`, `-2`, etc.

### Layout Patterns

1. **Root Layout** (`app/layout.tsx`): Provides ThemeProvider only
2. **Dashboard Layout** (`app/(dashboard)/layout.tsx`):
   - Auth check and user redirect
   - Project existence check
   - Sidebar with navigation
   - Used for all authenticated pages

### Component Structure

- `components/ui/` - shadcn/ui components with custom additions:
  - Standard components: Button, Card, Sidebar, Input, Textarea, Select, etc.
  - **New components**: `input-group` (with addons), `button-group` (grouped buttons), `progress-button` (button with progress bar for quota display)
  - `input-group` supports block-start/block-end/inline-start/inline-end alignment for addons
- `components/app-sidebar.tsx` - Main sidebar with project display and navigation
- `components/app-sidebar-wrapper.tsx` - Client wrapper for sidebar with logout handler
- `components/create-project-form.tsx` - Project creation form with slug auto-generation
- `components/create-article-form.tsx` - Article creation form with:
  - Markdown toolbar with grouped buttons (formatting, lists, blocks, media)
  - Heading dropdown selector (H1-H6)
  - Real-time content statistics display (words, characters, lines, read time)
  - Image upload with preview
  - Status selector (Draft/Published)
- `components/*-form.tsx` - Authentication forms (login, register)
- `components/upgrade-project.tsx` - Upgrade prompt shown when quota limits reached
- `components/banner-upload.tsx` - Article banner image upload with R2 integration
- `components/project-selector-modal.tsx` - Project selection during checkout flow

### Server Actions

Located in `lib/actions/`:
- `projects.ts` - Project CRUD operations
  - `getUserProjects()` - Fetch user's projects
  - `createProject()` - Create project with uniqueness check
  - `deleteProject()` - Delete project with ownership verification
- `articles.ts` - Article CRUD operations
  - `createArticle()` - Create article with auto-slug generation, stats calculation, and quota check
  - `getProjectArticles()` - Fetch all articles for a project
  - `deleteArticle()` - Delete article with ownership verification
- `api-keys.ts` - API key CRUD operations with Redis cache invalidation and quota checks
  - `createApiKey()` - Create API key with cache invalidation and quota check
  - `deleteApiKey()` - Soft delete API key with cache invalidation
  - `getProjectApiKeys()` - Fetch active API keys for a project
- `analytics.ts` - Analytics data aggregation and caching
  - `enableAnalytics()` - Enable analytics module and generate public key
  - `getAllProjectAnalytics()` - Load multi-period analytics with caching
  - `getProjectAnalytics()` - Load single period analytics
  - `getArticleViewsOverTime()` - Time-series data for article engagement
- `images.ts` - R2 (Cloudflare R2) image handling
  - `getR2UploadUrl()` - Generate presigned URLs for image uploads
  - `getR2BannerUploadUrl()` - Banner-specific upload URLs
  - `deleteR2Object()` - Delete objects from R2 and update storage quota
  - `assertR2ObjectIsImage()` - Validate uploaded files are images
  - `getPublicUrlForKey()` - Generate public URLs for R2 objects

### Article Management

**Article Model** includes content statistics automatically calculated on creation:
- `wordCount` - Total words in content
- `characterCount` - Total characters
- `lineCount` - Number of lines
- `readTimeMinutes` - Estimated reading time (200 words/minute)

**Article Slugs** are auto-generated from titles:
- Same normalization rules as project slugs
- Must be unique per project
- Conflict resolution with `-1`, `-2`, etc. suffixes

**Article Creation Flow**:
1. Form submission in `/articles/new` with title, excerpt, content, status, and optional cover image
2. Server action generates unique slug from title
3. Content statistics calculated automatically
4. Article saved with `published` flag and `publishedAt` timestamp if status is "published"
5. Redirects to `/articles` with revalidated cache

### Cache Invalidation Architecture

**API Key Caching System**:
- Redis cache shared between main app and API via `packages/db/src/redis.ts`
- API keys cached with 5-minute TTL on first API request
- Automatic cache invalidation when API keys are created or deleted
- Main app directly invalidates cache using shared `apiKeyCache` utilities
- No HTTP requests needed between main app and API for cache invalidation

**Analytics Caching**:
- Analytics data cached in Redis with `analyticsCacheUtils`
- Cache invalidated when new page views are tracked
- Multi-period caching (7, 30, 90 days) loaded in parallel for performance

**Cache Flow**:
1. API requests check Redis cache first (`packages/api/src/plugins/auth.ts`)
2. Cache miss triggers database lookup and cache population
3. Main app API key actions automatically invalidate relevant cache entries
4. Both systems share the same Redis instance for consistency

### Billing & Subscription System

**Architecture Overview**:
- **Project-level subscriptions**: Each project has its own subscription tier (STARTER or PRO)
- **Stripe integration**: Checkout sessions, subscription management, and webhook handling
- **Usage-based quotas**: Enforced limits on articles, API keys, storage, and monthly API calls
- **Automatic resets**: Monthly API call counter resets automatically

**Subscription Tiers** (`lib/subscription/plans.ts`):
- **STARTER** (Free):
  - 10 articles max
  - 2 API keys max
  - 100 MB storage
  - 10,000 API calls/month
- **PRO** ($9/month or $90/year):
  - Unlimited articles
  - Unlimited API keys
  - 10 GB storage
  - 1,000,000 API calls/month
  - Scheduled publishing
  - Article variants (future)
  - Bulk operations (future)

**Quota Enforcement** (`lib/subscription/quota-check.ts`):
- `checkArticleQuota(projectId)` - Validates article creation against subscription limit
- `checkApiKeyQuota(projectId)` - Validates API key creation against subscription limit
- `checkStorageQuota(projectId, fileSize)` - Validates file upload against storage limit
- `incrementMonthlyApiCalls(projectId)` - Tracks API usage, returns false if quota exceeded
- Quotas checked automatically in server actions before create operations
- Returns error messages with upgrade prompts when limits reached

**Stripe Integration** (`lib/stripe/`):
- `createCheckoutSession(projectId, priceId, interval)` - Initiates Stripe checkout
- `createBillingPortalSession(projectId)` - Opens Stripe billing portal for existing customers
- Webhook handler (`/api/webhooks/stripe`) processes:
  - `checkout.session.completed` - Creates/updates subscription on successful payment
  - `customer.subscription.updated` - Updates subscription tier and expiration
  - `customer.subscription.deleted` - Downgrades to STARTER on cancellation
  - `invoice.payment_succeeded` - Confirms renewal
  - `invoice.payment_failed` - Handles failed payments

**Usage Tracking**:
- `monthlyApiCalls` - Incremented on each API request via public API
- `apiCallsResetAt` - Automatically set to first day of next month
- `totalStorageUsed` - Updated on image upload/delete operations
- Limits checked before operations, not after

**Key Components**:
- `UpgradeProject` - Shows upgrade prompt when quota limits reached
- `ProgressButton` - Button with progress bar for displaying quota usage
- `UsageCard` - Displays current usage statistics for resources
- `ProjectSelectorModal` - Modal for selecting project during checkout

**Key Hooks**:
- `useSubscriptionLimits(projectId)` - Load subscription data, usage, and limits
- `useApiKeyLimits(projectId)` - Specialized hook for API key quota checking
- `useArticleLimits(projectId)` - Specialized hook for article quota checking
- Returns: `{ subscription, usage, limits, isLoading, canCreate*, used*, limit* }`

**Billing Flow**:
1. User clicks "Upgrade" on pricing page or in-app prompt
2. `createCheckoutSession()` creates Stripe session with project metadata
3. User completes payment on Stripe hosted page
4. Stripe webhook fires `checkout.session.completed`
5. Server updates Project with `subscriptionTier: PRO`, `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionExpiresAt`
6. User gains access to PRO features immediately
7. Monthly renewals handled via `customer.subscription.updated` webhook

**Important Notes**:
- Subscription is tied to Project, not User (one user can have multiple projects with different tiers)
- Free tier users can access billing portal to upgrade
- PRO users can access billing portal to manage subscription, view invoices, update payment method
- Quota checks happen synchronously in server actions to prevent race conditions
- Storage usage updated in real-time on R2 operations

### Analytics System

**Analytics Activation Flow**:
- Project-level feature flag: `analyticsEnabled` (default: false)
- First visit to `/analytics` shows activation UI (`components/analytics-activation.tsx`)
- Activation automatically generates a public API key (`pk_`) with `analytics` permission
- After activation, displays integration guide with tracking script

**Analytics Tracking Script** (`public/analytics.js`):
- Client-side script using data attributes: `<script src="https://cdn.simplist.blog/analytics.js" data-api-key="pk_xxx"></script>`
- Auto-detects article slug from URL (last path segment) if not provided via `data-slug`
- Tracks: page views, unique visitors, time on page, scroll depth, bounce rate, device/browser, geo data
- Bot detection to filter automated traffic
- Uses `sendBeacon` for reliable tracking on page unload

**Analytics API** (`packages/api/src/routes/analytics.ts`):
- `POST /analytics/track` - Track new page view with initial metrics
- `PUT /analytics/track/:pageViewId` - Update page view with final engagement metrics
- `GET /analytics/stats` - Retrieve aggregated analytics data (requires `read` permission)
- Public key authentication via `X-API-Key` header
- Geo data fetched client-side from ipinfo.io (privacy-focused, no IP storage)

**Analytics Dashboard** (`app/(dashboard)/analytics/page.tsx`):
- Multi-period view (7, 30, 90 days) with parallel data loading
- Integration guide shown at top when analytics enabled
- Charts: views over time, engagement metrics, device/browser distribution
- Tables: top articles, referrers, countries, recent activity
- Optional article filtering via `?articles=id1,id2` query param

**Server Actions** (`lib/actions/analytics.ts`):
- `enableAnalytics(projectId)` - Enable analytics and generate public key
- `getAllProjectAnalytics(projectId, articleIds?)` - Load all periods with caching
- `getProjectAnalytics(projectId, days, articleIds?)` - Load single period
- `getBatchArticleViewsOverTime(articleIds[], days)` - Optimized batch query for article charts

### Middleware

`middleware.ts` adds `x-pathname` header to request for server-side pathname access in layouts.

## UI/UX Conventions

### Text and Language
- **All UI text in English**: Labels, placeholders, buttons, etc.
- Error messages and user feedback should be clear and actionable

### Component Patterns
- **Server actions** imported at top of client components (no dynamic imports)
- **Form submissions**: Use `router.push()` + `router.refresh()` after successful actions
- **Button groups**: Use shadcn `ButtonGroup` for related actions
- **Input groups**: Use shadcn `InputGroup` with addons for enhanced inputs
- **Loading states**: Show `Spinner` component during async operations
- **File references**: Use markdown link syntax `[file.ts](path/to/file.ts)` for clickable links

### Article Editor
- Markdown toolbar organized into groups: formatting, lists, blocks, media
- Heading selector as dropdown (H1-H6) in media group
- Content statistics shown at bottom of editor using `InputGroupAddon`
- Image upload shows preview with aspect-video ratio

## Key Technical Decisions

1. **Better Auth over NextAuth**: Using Better Auth v1.3.27 for authentication
2. **Turbopack**: Development and build use `--turbopack` flag
3. **Port 3000**: Dev server runs on port 3000, API on port 3001
4. **Dark theme default**: Application defaults to dark mode
5. **Prisma singleton**: Database client uses singleton pattern to prevent multiple instances
6. **Route groups**: `(dashboard)` group for authenticated pages with sidebar
7. **Content statistics**: Auto-calculated on article creation (words, chars, lines, read time)
8. **Monorepo architecture**: Shared packages for DB, API, and SDK
9. **pnpm workspaces**: Package management with pnpm
10. **Upstash Redis caching**: API key caching with automatic invalidation on create/revoke
11. **Project-level subscriptions**: Billing and quotas managed per project, not per user
12. **Cloudflare R2**: Object storage for images with quota tracking

## Coding Standards and Rules

### Function and Export Conventions
- **Use arrow functions** for all top-level functions and React components
- **Components/pages/layouts**: `const Component = (props) => { ... }` then `export default Component`
- **Hooks/util functions**: `export const useX = (...) => { ... }` / `export const doX = (...) => { ... }`
- **Next.js route handlers**: Export arrow consts (`export const POST = async (req: Request) => { ... }`)
- **Avoid hoisting**: Declare before use

### React/Next.js Rules
- **Prefer server components** by default; add "use client" only when needed (state, effects, event handlers, browser APIs)
- **Pages and layouts** must remain default-exported symbols
- **Keep client components pure** (no side effects at module scope)
- **Place data fetching** in server components/route handlers when possible

### TypeScript Guidelines
- **Strict typing** for public APIs and component props
- **Explicit function signatures** for exported items; allow local inference
- **Avoid `any`** unless unavoidable; prefer safe unions and generics

### Naming Conventions
- **Functions/components**: `verbNoun` for actions, `Noun` for components
- **No single-letter names**; use descriptive identifiers
- **Hooks start with `use`** and return stable shapes

### Control Flow & Error Handling
- **Use early returns** to reduce nesting
- **Never swallow errors silently**; log with context and return typed error responses
- **Async code**: prefer `try/catch` only around operations that can throw

### File Structure Rules
- `app/**`: route segments, pages, layouts, and route handlers
- `components/**`: shared UI and feature components
  - Do not modify `components/ui/**` without explicit request
- `hooks/**`: reusable hooks
- `lib/**`: actions, auth, db, utils, validations
- `packages/db/**`: shared database schema and client
- `packages/api/**`: public Fastify API
- `packages/sdk/**`: TypeScript SDK for NPM

### Import Guidelines
- **Absolute imports** via `@/` alias when available; otherwise relative, shortest path
- **Group imports**: external → internal → styles/assets; side-effect imports last

### Project-Specific Rules
- **Image uploads** use R2 presigned URLs via `lib/actions/images.ts` server actions
- **Article editor mutations** should go through `lib/actions/**`
- **Banner/image constraints** enforced server-side (mime/size) and client-side hints
- **API key authentication** handled in `packages/api/src/plugins/auth.ts`
- **Database operations** use shared `@simplist/db` package
- **Redis caching** shared via `@simplist/db` package with `apiKeyCache` utilities
- **Quota checks** must happen before create operations in server actions (articles, API keys, storage)
- **Subscription checks** performed via `lib/subscription/quota-check.ts` utilities
- **Storage usage** updated in R2 operations (upload increments, delete decrements)
- **Monthly API calls** reset automatically on first day of month via `apiCallsResetAt` check

### Performance Guidelines
- **Memoize heavy calculations** or lists where needed
- **Avoid unnecessary state**; derive from props when possible
- **Use Fastify plugins** for API optimizations (compression, rate limiting)

### Accessibility Requirements
- **Buttons/links** with clear text; icons require accessible text or `aria-label`
- **Forms**: associate `Label` with controls; provide error text

### Quality Assurance
- **Must pass TypeScript and ESLint**; fix new errors introduced by edits
- **Follow existing formatting**; do not reflow unrelated code
- **Minimal comments**; only add non-obvious rationale or invariants

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
