# AGENTS.md

## Commands

### Development

```bash
pnpm dev                    # Start all apps
pnpm --filter @simplist/api run dev    # API only (port 4000)
pnpm --filter @simplist/app run dev    # Dashboard only (port 3000)
```

### Build & Lint

```bash
pnpm build                  # Build all packages
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier
```

### Testing

```bash
cd apps/api && pnpm test    # Run all tests
cd apps/api && pnpm test path/to/test.ts  # Run single test
```

### Database

```bash
pnpm db:push                # Push schema changes (dev)
pnpm db:migrate             # Create and apply migrations
pnpm db:studio              # Open Prisma Studio
```

## Code Style

### TypeScript

- Strict mode enabled with `noUncheckedIndexedAccess`
- Use explicit return types for public functions
- Prefer `const` assertions for object literals
- Import types with `import type`

### React/Next.js

- Use functional components with hooks
- Server Actions in `lib/actions/`
- Client components: `"use client"` directive
- shadcn/ui components from `@simplist/ui`

### Imports

- Absolute imports: `@/components`, `@/lib`, `@/hooks`
- Workspace packages: `@simplist/db`, `@simplist/ui`
- Group imports: external, then internal, then relative

### Naming

- Components: PascalCase
- Functions/variables: camelCase
- Files: kebab-case for pages, PascalCase for components
- Constants: UPPER_SNAKE_CASE

### Error Handling

- Use Zod schemas for validation
- Server Actions return `{ error: string } | { success: true }`
- API routes use Fastify error handling
- Database errors via Prisma

### Testing

- Vitest in `apps/api`
- Test files: `*.test.ts` or `*.spec.ts`
- Mock external services and databases

## CRITICAL RULES

### NEVER USE THESE COMMANDS

**NEVER, EVER use `git clean` in any form.** This command deletes untracked files permanently and has caused catastrophic data loss in this project. There is NO recovery possible.

Forbidden commands:

- `git clean -fd` - DESTROYS all untracked files
- `git clean -f` - DESTROYS all untracked files
- `git clean -d` - DESTROYS untracked directories
- `git clean` with ANY flags - FORBIDDEN

If you need to reset changes, use ONLY:

- `git checkout -- <file>` - Reverts tracked file changes
- `git restore <file>` - Reverts tracked file changes
- `git stash` - Temporarily saves changes (recoverable)
