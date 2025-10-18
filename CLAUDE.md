# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a simple blog management system built with Next.js 15, using the App Router with React Server Components. It's a **single-project-per-user** application where each authenticated user can create one blog project to manage articles and API keys.

The project now includes a **monorepo architecture** with:
- `packages/db/` - Shared Prisma schema and database client
- `packages/api/` - Public Fastify API for content consumption (api.simplist.blog)
- `packages/sdk/` - TypeScript SDK for NPM (@simplist/sdk)
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

**Environment Setup**: Both main app and API require Redis environment variables:
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis authentication token

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
- Schema includes: User, Session, Account, Verification, Project, ApiKey, Article, Asset
- Connection string: `postgresql://postgres:postgres@localhost:5432/simplist?schema=public`

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
- **Published on NPM** as `@simplist/sdk`
- **ESM/CJS support** for maximum compatibility

### Route Structure

**Public routes** (no auth required):
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password recovery
- `/` - Root redirects to `/dashboard` or `/auth/login`

**Protected routes** (require auth, in `app/(dashboard)/` group):
- `/dashboard` - Main dashboard
- `/articles` - Article management (list view with data table)
- `/articles/new` - Article creation form (responsive 2-column layout on desktop)
- `/api-keys` - API key management
- `/settings` - Settings

**Special route**:
- `/create-project` - First-time project creation (outside dashboard group, no sidebar)

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
  - **New components**: `input-group` (with addons), `button-group` (grouped buttons)
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

### Server Actions

Located in `lib/actions/`:
- `projects.ts` - Project CRUD operations
  - `getUserProjects()` - Fetch user's projects
  - `createProject()` - Create project with uniqueness check
  - `deleteProject()` - Delete project with ownership verification
- `articles.ts` - Article CRUD operations
  - `createArticle()` - Create article with auto-slug generation and stats calculation
  - `getProjectArticles()` - Fetch all articles for a project
  - `deleteArticle()` - Delete article with ownership verification
- `api-keys.ts` - API key CRUD operations with Redis cache invalidation
  - `createApiKey()` - Create API key with cache invalidation
  - `deleteApiKey()` - Soft delete API key with cache invalidation
  - `getProjectApiKeys()` - Fetch active API keys for a project

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

**Cache Flow**:
1. API requests check Redis cache first (`packages/api/src/plugins/auth.ts`)
2. Cache miss triggers database lookup and cache population
3. Main app API key actions automatically invalidate relevant cache entries
4. Both systems share the same Redis instance for consistency

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
- **Image uploads** must use server routes (`/api/uploads/*`) rather than direct client-to-bucket calls
- **Article editor mutations** should go through `lib/actions/**`
- **Banner/image constraints** enforced server-side (mime/size) and client-side hints
- **API key authentication** handled in `packages/api/src/plugins/auth.ts`
- **Database operations** use shared `@simplist/db` package
- **Redis caching** shared via `@simplist/db` package with `apiKeyCache` utilities

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
