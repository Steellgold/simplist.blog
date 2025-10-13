# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simplist is a simple blog management system built with Next.js 15, using the App Router with React Server Components. It's a **single-project-per-user** application where each authenticated user can create one blog project to manage articles and API keys.

## Development Commands

```bash
# Development server (runs on port 4000)
npm run dev

# Database operations
npm run db:migrate      # Run Prisma migrations
npm run db:push         # Push schema changes without migration
npm run db:studio       # Open Prisma Studio

# Build and production
npm run build           # Build with Turbopack
npm run start           # Start production server
npm run lint            # Run ESLint
```

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
- `/articles` - Article management
- `/api-keys` - API key management
- `/settings` - Settings

**Special route**:
- `/create-project` - First-time project creation (outside dashboard group, no sidebar)

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

- `components/ui/` - shadcn/ui components (Button, Card, Sidebar, etc.)
- `components/app-sidebar.tsx` - Main sidebar with project display and navigation
- `components/app-sidebar-wrapper.tsx` - Client wrapper for sidebar with logout handler
- `components/create-project-form.tsx` - Project creation form with slug auto-generation
- `components/*-form.tsx` - Authentication forms (login, register)

### Server Actions

Located in `lib/actions/`:
- `projects.ts` - Project CRUD operations
  - `getUserProjects()` - Fetch user's projects
  - `createProject()` - Create project with uniqueness check
  - `deleteProject()` - Delete project with ownership verification

### Middleware

`middleware.ts` adds `x-pathname` header to request for server-side pathname access in layouts.

## Key Technical Decisions

1. **Better Auth over NextAuth**: Using Better Auth v1.3.27 for authentication
2. **Turbopack**: Development and build use `--turbopack` flag
3. **Port 4000**: Dev server runs on port 4000 (not default 3000)
4. **Dark theme default**: Application defaults to dark mode
5. **Prisma singleton**: Database client uses singleton pattern to prevent multiple instances
6. **Route groups**: `(dashboard)` group for authenticated pages with sidebar
