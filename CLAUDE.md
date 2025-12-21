# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a headless CMS and content analytics platform for blogs and technical documentation. It's a multi-tenant SaaS application where users manage multiple projects, publish articles via an API-first architecture, and track analytics.

**Key Technologies:**

- Node.js >= 20
- PNPM 10.4.1 (package manager)
- TypeScript 5.9.3 (strict mode)
- Turborepo (monorepo orchestration)

---

## Monorepo Structure

This is a pnpm workspace managed by Turbo with 4 main applications and 6 shared packages:

### Applications

| App           | Port         | Purpose             | Stack                                     |
| ------------- | ------------ | ------------------- | ----------------------------------------- |
| **apps/app**  | 3000 (HTTPS) | Main SaaS dashboard | Next.js 16, React 19, Better-Auth, Stripe |
| **apps/web**  | 3001 (HTTPS) | Marketing website   | Next.js 16, React 19, Motion              |
| **apps/api**  | 4000         | REST API backend    | Fastify 5.6, Zod, Cron                    |
| **apps/docs** | 3002         | Documentation site  | Next.js 16, MDX, Shiki                    |

### Packages

| Package                        | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| **packages/db**                | Prisma ORM with PostgreSQL schema, migrations, and Redis caching |
| **packages/ui**                | 84+ shared React components (Radix UI + shadcn/ui + Tailwind)    |
| **packages/sdk**               | Published TypeScript SDK (`@simplist.blog/sdk` on npm)           |
| **packages/limits**            | Subscription tier definitions and quota limits                   |
| **packages/eslint-config**     | Shared ESLint configurations                                     |
| **packages/typescript-config** | Shared TypeScript configurations                                 |

---

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

---

## Architecture Deep Dive

### apps/app - SaaS Dashboard

The main admin dashboard for managing projects, articles, billing, and analytics.

#### Directory Structure

```
apps/app/
├── app/                          # Next.js App Router
│   ├── [project-slug]/           # Dynamic project routes
│   │   ├── analytics/            # Analytics dashboard (PRO only)
│   │   ├── articles/             # Article CRUD
│   │   │   ├── new/              # Create article
│   │   │   └── [slug]/edit/      # Edit article
│   │   ├── api-keys/             # API key management
│   │   ├── tags/                 # Tag management
│   │   └── settings/             # Project settings
│   │       ├── billing/          # Subscription & invoices
│   │       ├── members/          # Team management
│   │       └── roles/            # Custom roles
│   ├── account/                  # User account settings
│   │   └── settings/security/    # 2FA, passkeys, password
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── 2fa-verify/
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/        # Better-auth handler
│   │   ├── webhooks/stripe/      # Stripe webhooks
│   │   └── uploads/              # Image uploads to R2
│   ├── create-project/           # Project creation
│   └── invitations/[token]/      # Accept team invitations
├── components/                   # React components by domain
│   ├── articles/                 # Article editor components
│   │   ├── content-editor.tsx    # Rich text editor
│   │   ├── schedule-picker.tsx   # Scheduled publishing
│   │   ├── visibility-card.tsx   # Publish status
│   │   ├── variant-card.tsx      # Multi-language variants
│   │   └── article-tags-input.tsx
│   ├── analytics/                # Analytics dashboard
│   ├── api-keys/                 # API key management
│   ├── billing/                  # Stripe billing UI
│   ├── members/                  # Team management
│   ├── roles/                    # Role management
│   └── auth/                     # Auth forms
├── lib/
│   ├── actions/                  # Server Actions
│   │   ├── articles.ts           # Article CRUD
│   │   ├── projects.ts           # Project management
│   │   ├── members.tsx           # Team invitations
│   │   ├── api-keys.ts           # API key generation
│   │   ├── tags.ts               # Tag management
│   │   ├── analytics.ts          # Analytics queries
│   │   └── roles.ts              # Role management
│   ├── auth/                     # Authentication
│   │   ├── auth.tsx              # Better-auth config
│   │   ├── auth-client.ts        # Client-side auth
│   │   ├── auth-helper.ts        # Session utilities
│   │   └── permissions.ts        # RBAC permissions
│   ├── stripe/                   # Stripe integration
│   ├── subscription/             # Quota checking
│   ├── validations/              # Zod schemas
│   └── types/
│       └── languages.ts          # 80+ language codes
└── hooks/                        # React hooks
    ├── use-variant-operations.ts # Multi-language CRUD
    └── use-subscription-limits.ts
```

#### Key Features

- **Article Management**: Create, edit, schedule, soft-delete articles
- **Multi-language Support**: 80+ languages with variant system
- **Team Collaboration**: Invite members with custom roles (8 permissions)
- **Billing**: Stripe subscription with STARTER/PRO tiers
- **Analytics**: Page views, visitors, geographic data (PRO only)
- **Authentication**: Email/password, GitHub, Google, 2FA, passkeys

#### Permissions System

```typescript
// lib/auth/permissions.ts
type Permission =
  | "canManageProject"
  | "canManageMembers"
  | "canManageRoles"
  | "canManageArticles"
  | "canManageApiKeys"
  | "canViewAnalytics"
  | "canManageBilling"
  | "canDeleteProject";
```

---

### apps/api - Fastify REST API

The public API backend for article delivery, analytics tracking, and SEO generation.

#### Directory Structure

```
apps/api/src/
├── server.ts                     # Main Fastify server
├── routes/
│   ├── articles.ts               # GET /v1/articles, /v1/articles/:slug
│   ├── analytics.ts              # POST/PUT /v1/analytics/track, GET /v1/analytics/stats
│   ├── projects.ts               # GET /v1/project
│   ├── tags.ts                   # GET /v1/tags, /v1/tags/:name
│   ├── seo.ts                    # GET /v1/seo/sitemap, /rss, /structured-data
│   └── cron.ts                   # POST /cron/publish-scheduled
├── plugins/
│   ├── auth.ts                   # API key validation + quota tracking
│   ├── analytics-auth.ts         # Analytics-specific auth
│   ├── cors.ts                   # Global CORS
│   ├── project-cors.ts           # Project-specific origins
│   ├── rate-limit.ts             # 100 req/min per key
│   ├── helmet.ts                 # Security headers
│   └── compression.ts            # Gzip/Brotli
├── schemas/                      # Zod validation
├── services/
│   └── scheduler.ts              # Cron job scheduler
└── utils/
    ├── article-cache.ts          # Redis caching with versioning
    ├── bot-detection.ts          # Bot identification
    └── seo-generator.ts          # SEO metadata generation
```

#### API Endpoints

**Articles**

- `GET /v1/articles` - List with pagination, filtering, sorting
- `GET /v1/articles/:slug` - Single article with optional SEO

**Analytics**

- `POST /v1/analytics/track` - Track page view
- `PUT /v1/analytics/track/:pageViewId` - Update engagement metrics
- `GET /v1/analytics/stats` - Aggregated statistics (requires "read" permission)

**SEO**

- `GET /v1/seo/sitemap` - XML/JSON sitemap
- `GET /v1/seo/rss` - RSS feed
- `GET /v1/seo/structured-data` - JSON-LD schema
- `GET /v1/seo/article/:slug` - Article SEO metadata

**Tags**

- `GET /v1/tags` - All tags with article counts
- `GET /v1/tags/:name` - Single tag details

**Project**

- `GET /v1/project` - Project info and statistics

#### Authentication

- Header: `X-API-Key`
- Keys prefixed with `prj_`
- Cached in Redis for performance
- Quota tracking: 1,000/month (STARTER), 500,000/month (PRO)

#### Caching Strategy

```typescript
// Redis keys with versioning (5-min TTL)
articles:version:{projectId}
articles:list:{projectId}:v{version}:{params}
articles:single:{projectId}:v{version}:{slug}
seo:sitemap:{projectId}:{format}
seo:rss:{projectId}:{limit}
```

---

### apps/web - Marketing Website

Public-facing landing page and pricing information.

#### Directory Structure

```
apps/web/app/
├── page.tsx                      # Home page
├── pricing/page.tsx              # Interactive pricing page
├── legal/
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   └── gdpr/page.tsx
└── _sections/                    # Home page sections
    ├── hero-section.tsx          # Value proposition + CTAs
    ├── features-section.tsx      # 6 feature cards with animations
    └── api-demo-section.tsx      # Code examples
```

#### Key Components

- **Navbar**: Sticky header with links to Features, Pricing, Docs
- **Footer**: Product links, legal pages, theme switcher
- **Pricing**: Monthly/yearly toggle with animated price transitions

---

### apps/docs - Documentation Site

Interactive documentation with SDK and REST API reference.

#### Directory Structure

```
apps/docs/
├── content/                      # MDX documentation
│   ├── index.mdx                 # Getting started
│   ├── sdk/                      # SDK documentation
│   │   ├── articles.mdx
│   │   ├── analytics.mdx
│   │   ├── seo.mdx
│   │   └── multilingual.mdx
│   ├── api/                      # REST API reference
│   │   ├── get-articles.mdx
│   │   ├── post-track.mdx
│   │   └── get-sitemap.mdx
│   └── examples/                 # Usage examples
├── app/
│   ├── [[...slug]]/page.tsx      # Dynamic MDX rendering
│   └── api/search/route.ts       # Full-text search
├── components/                   # 30+ doc components
│   ├── code-block.tsx            # Syntax highlighting (Shiki)
│   ├── type-table.tsx            # Type definitions
│   ├── api-route.tsx             # Endpoint display
│   ├── installation-tabs.tsx     # npm/pnpm/yarn/bun
│   └── search-command.tsx        # Cmd+K search
└── lib/
    └── search.ts                 # Search implementation
```

#### Features

- **Dual-mode navigation**: Toggle between SDK and REST API docs
- **Full-text search**: Cmd+K powered search across all content
- **Code highlighting**: Shiki with language tabs
- **Interactive examples**: Copy-paste curl commands

---

### packages/db - Database Layer

Prisma ORM with PostgreSQL and Redis caching.

#### Key Models (20 total)

**User & Auth**

```prisma
model User {
  id, name, email, emailVerified, image
  sessions, accounts, projects, projectMembers
  twofactors, passkeys  // 2FA and WebAuthn
}
```

**Project & Content**

```prisma
model Project {
  id, name, slug, icon, color, timezone, defaultLanguage
  tier (STARTER/PRO), stripeCustomerId, stripeSubscriptionId
  monthlyApiCalls, apiCallsResetAt  // Quota tracking
  articles, tags, apiKeys, members, roles
}

model Article {
  id, title, slug, content, excerpt, coverImage
  status (draft/published/deleted/scheduled)
  scheduledPublishAt, publishedAt
  viewCount, wordCount, readTimeMinutes
  author, lastUpdatedBy, tags, variants
}

model ArticleVariant {
  lang (ISO 639-1), title, excerpt, content
  wordCount, readTimeMinutes
}

model Tag {
  name, color (Color enum), icon
}
```

**Analytics**

```prisma
model PageView {
  visitorId, sessionId
  country, city, timezone
  device, browser, os, screenWidth, screenHeight
  referrer, utmSource, utmMedium, utmCampaign
  timeOnPage, scrollDepth, bounced
  requestSource (direct/sdk)
}
```

**Team & Permissions**

```prisma
model ProjectMember {
  userId, projectId, roleId
}

model ProjectRole {
  name, isOwner, isDefault
  canManageProject, canManageMembers, canManageRoles
  canManageArticles, canManageApiKeys, canViewAnalytics
  canManageBilling, canDeleteProject
}
```

---

### packages/ui - Component Library

84+ React components based on Radix UI and Tailwind CSS.

#### Component Categories

- **Basic**: button, card, dialog, input, select, table, tabs, etc.
- **Forms**: form, input-group, password-input, textarea
- **Navigation**: sidebar, menubar, breadcrumb, pagination
- **Feedback**: alert, toast (sonner), progress, skeleton
- **Specialized**: color-selector, icon-picker, timezone-selector, calendar
- **Animated Icons**: 17 animated icons (settings, chart-line, star, etc.)

#### Usage

```tsx
import { Button } from "@simplist/ui/components/button";
import { Card } from "@simplist/ui/components/card";
import { useIsMobile } from "@simplist/ui/hooks/use-mobile";
```

#### Adding Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

---

### packages/sdk - Public TypeScript SDK

Published npm package for external API consumption.

#### Installation

```bash
npm install @simplist.blog/sdk
```

#### Usage

```typescript
import { SimplistClient } from "@simplist.blog/sdk";

const client = new SimplistClient({
  apiKey: "prj_...", // or SIMPLIST_API_KEY env var
  baseUrl: "https://api.simplist.blog",
  apiVersion: "1",
});

// Articles
const articles = await client.articles.list({ limit: 10 });
const article = await client.articles.get("my-article-slug");

// Analytics
await client.analytics.track({
  slug: "my-article",
  sessionId: "unique-session-id",
  pageUrl: "https://example.com/blog/my-article",
});

// SEO
const sitemap = await client.seo.getSitemap();
const rss = await client.seo.getRssFeed();
```

#### Resources

- `client.articles` - Article listing and retrieval
- `client.tags` - Tag management
- `client.project` - Project info and stats
- `client.analytics` - Page view tracking and stats
- `client.seo` - Sitemap, RSS, structured data

---

### packages/limits - Subscription Tiers

Defines plan limits and features.

#### Plans

```typescript
// STARTER (Free)
{
  maxArticles: 5,
  maxStorageBytes: 15 * 1024 * 1024,  // 15MB
  maxApiCallsPerMonth: 1000,
  maxVariantsPerArticle: 0,
  maxMembers: 1,
  maxWebhooks: 1,
  features: {
    analytics: false,
    postVariants: false,
    scheduledPublishing: false,
    prioritySupport: true,
    bulkOperations: false,
    webhooks: true
  }
}

// PRO ($9.99/month or $7.99/month yearly)
{
  maxArticles: -1,  // Unlimited
  maxStorageBytes: 1024 * 1024 * 1024,  // 1GB
  maxApiCallsPerMonth: -1,  // Unlimited
  maxVariantsPerArticle: -1,  // Unlimited
  maxMembers: 10,
  maxWebhooks: 20,
  features: {
    analytics: true,
    postVariants: true,
    scheduledPublishing: true,
    prioritySupport: true,
    bulkOperations: true,
    webhooks: true
  }
}
```

---

## Authentication

- **Provider**: Better-Auth v1.4.6 with Prisma adapter
- **Methods**: Email/password, GitHub OAuth, Google OAuth, Passkeys (WebAuthn), 2FA (TOTP)
- **Email**: AWS SES for verification and password reset
- **Configuration**: `apps/app/lib/auth.tsx`

---

## External Integrations

| Service       | Purpose                        | Config Location                        |
| ------------- | ------------------------------ | -------------------------------------- |
| PostgreSQL    | Primary database               | `DATABASE_URL`                         |
| Upstash Redis | API key cache, analytics cache | `UPSTASH_REDIS_REST_*`                 |
| Stripe        | Subscriptions, billing         | `STRIPE_*`                             |
| Cloudflare R2 | Image storage (S3-compatible)  | `R2_*`                                 |
| AWS SES       | Email sending                  | `AWS_ACCESS_KEY_ID`, `SES_FROM_EMAIL`  |
| GitHub/Google | OAuth providers                | `GITHUB_CLIENT_ID`, `GOOGLE_CLIENT_ID` |

---

## Environment Variables

Required variables are defined in `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="https://app.simplist.blog"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."

# Email (AWS SES)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
SES_FROM_EMAIL="..."

# Cache (Upstash Redis)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Payments (Stripe)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# API
CRON_SECRET="..."  # For scheduled job authentication
```

---

## Testing Conventions

Tests are located in `apps/api` and use Vitest. Run with `pnpm test` in the api directory.

---

## Important Notes

- The main dashboard (`apps/app`) runs on HTTPS by default in development (port 3000)
- API authentication is header-based (`X-API-Key`), not token-based
- All database changes should go through Prisma migrations, not direct schema edits
- The SDK package is published to npm as `@simplist.blog/sdk`
- TypeScript 5.9.3 is used across the entire monorepo with strict mode enabled
- Multi-tenant: All data is scoped to projects, users can have multiple projects
- Soft deletes: Articles use status field, not hard deletion
- Rate limiting: 100 requests/minute per API key or IP

---

## Documentation CodeBlock Formatting

When writing MDX documentation in `apps/docs/content/`, **CodeBlock components must follow this exact indentation pattern**:

```jsx
<CodeBlock language="typescript" filename="example.ts">
  {`
  import { SimplistClient } from "@simplist.blog/sdk"

  const client = new SimplistClient({
    apiKey: process.env.SIMPLIST_API_KEY,
    path: 'blog'
  })
  `}
</CodeBlock>
```

**Rules:**

1. The `{` backtick must be indented 2 spaces from `<CodeBlock`
2. **Every line of code inside** must have 2 spaces of indentation (the code's own indentation is additional)
3. The closing backtick `}` must also be indented 2 spaces
4. `</CodeBlock>` is at the same level as `<CodeBlock>`

**WRONG:**

```jsx
<CodeBlock language="typescript">
  {`
const x = 1  // No indentation - WRONG
`}
</CodeBlock>
```

**CORRECT:**

```jsx
<CodeBlock language="typescript">
  {`
  const x = 1  // 2-space indentation - CORRECT
  `}
</CodeBlock>
```

---

## Data Flow

```
User Request → Next.js App Router
    ↓
Server Action (lib/actions/*.ts)
    ↓
Permission Check (lib/auth/permissions.ts)
    ↓
Database Query (Prisma via @simplist/db)
    ↓
Cache Invalidation (revalidatePath)
    ↓
Response + Toast Notification
```

```
API Request → Fastify Server
    ↓
Middleware (CORS, Rate Limit, Auth)
    ↓
API Key Validation + Quota Check
    ↓
Redis Cache Check
    ↓
Database Query (if cache miss)
    ↓
Response with caching
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIMPLIST.BLOG                           │
├─────────────────────────────────────────────────────────────────┤
│  APPS                                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │   apps/app   │ │   apps/web   │ │   apps/api   │ │apps/docs│ │
│  │   Dashboard  │ │   Marketing  │ │   REST API   │ │  Docs   │ │
│  │   :3000      │ │   :3001      │ │   :4000      │ │  :3002  │ │
│  └──────┬───────┘ └──────────────┘ └──────┬───────┘ └─────────┘ │
│         │                                 │                     │
├─────────┴─────────────────────────────────┴─────────────────────┤
│  PACKAGES                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ packages/db  │ │ packages/ui  │ │ packages/sdk │             │
│  │ Prisma+Redis │ │ 84+ React UI │ │ Public SDK   │             │
│  └──────┬───────┘ └──────────────┘ └──────────────┘             │
│         │                                                       │
│  ┌──────┴───────┐                                               │
│  │ packages/    │                                               │
│  │ limits       │                                               │
│  └──────────────┘                                               │
├─────────────────────────────────────────────────────────────────┤
│  EXTERNAL SERVICES                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ PostgreSQL │ │   Redis    │ │   Stripe   │ │ Cloudflare R2│  │
│  │  Database  │ │   Cache    │ │  Payments  │ │   Storage    │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```
