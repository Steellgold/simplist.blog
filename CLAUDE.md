# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a simple blog management system built with Next.js 15, using the App Router with React Server Components. It's a **single-project-per-user** application where each authenticated user can create one blog project to manage articles and API keys.

## Development Commands

```bash
# Development server (runs on port 4000)
npm run dev

# Database operations
npm run db:migrate      # Run Prisma migrations (use after schema changes)
npm run db:push         # Push schema changes without migration (dev only)
npm run db:studio       # Open Prisma Studio

# Build and production
npm run build           # Build with Turbopack
npm run start           # Start production server
npm run lint            # Run ESLint
```

**Important**: After modifying `prisma/schema.prisma`, always run `npm run db:migrate` to apply changes. The Article model includes statistics fields that must be migrated.

## Architecture

### Authentication Flow

- Uses **Better Auth** (`lib/auth.ts`) with Prisma adapter
- Supports email/password and OAuth (Google, GitHub)
- Client-side auth via `authClient` from `lib/auth-client.ts`
- Server-side user retrieval via `getCurrentUser()` from `lib/auth-helper.ts`

### Database

- **PostgreSQL** with Prisma ORM
- Singleton pattern for Prisma client in `lib/db.ts` to prevent connection issues
- Schema includes: User, Session, Account, Verification, Project, ApiKey, Article
- Connection string: `postgresql://postgres:postgres@localhost:5432/simplist?schema=public`

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
3. **Port 4000**: Dev server runs on port 4000 (not default 3000)
4. **Dark theme default**: Application defaults to dark mode
5. **Prisma singleton**: Database client uses singleton pattern to prevent multiple instances
6. **Route groups**: `(dashboard)` group for authenticated pages with sidebar
7. **Content statistics**: Auto-calculated on article creation (words, chars, lines, read time)
