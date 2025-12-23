<img width="1077" height="225" alt="Simplist Banner" src="https://github.com/user-attachments/assets/1f5112dd-6813-4203-acb8-20e026a3d8f1" />

A modern, full-stack blogging platform with API, dashboard, and SDK.

## Project Structure

```
simplist.blog/
├── apps/
│   ├── api/          # Fastify API server
│   ├── app/          # Next.js dashboard application
│   ├── docs/         # Documentation site
│   └── web/          # Marketing website
├── packages/
│   ├── db/           # Prisma database schema and client
│   ├── limits/       # Plan limits and types
│   ├── sdk/          # TypeScript SDK for the API
│   └── ui/           # Shared UI components (shadcn/ui)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Steellgold/simplist.blog.git
cd simplist.blog
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:

```bash
pnpm db:push
```

### Development

Start all applications:

```bash
pnpm dev
```

Or start individual apps:

```bash
pnpm --filter @simplist/api run dev    # API (port 4000)
pnpm --filter @simplist/app run dev    # Dashboard (port 3000)
pnpm --filter @simplist/docs run dev   # Docs (port 3001)
pnpm --filter @simplist/web run dev    # Website (port 3002)
```

## Available Scripts

### Build & Lint

```bash
pnpm build                  # Build all packages
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier
```

### Testing

```bash
cd apps/api && pnpm test    # Run all tests
```

### Database

```bash
pnpm db:push                # Push schema changes (dev)
pnpm db:migrate             # Create and apply migrations
pnpm db:studio              # Open Prisma Studio
```

## Tech Stack

- **Framework**: Next.js 16, React 19
- **API**: Fastify
- **Database**: PostgreSQL with Prisma
- **Authentication**: Better Auth
- **UI**: shadcn/ui, Tailwind CSS
- **Payments**: Stripe
- **Email**: React Email with Resend
- **Deployment**: Vercel

## Adding UI Components

To add shadcn/ui components:

```bash
pnpm dlx shadcn@latest add button -c apps/app
```

Components are shared from the `@simplist/ui` package:

```tsx
import { Button } from "@simplist/ui/components/button";
```

## Documentation

For detailed documentation, see:

- [Development Guide](./AGENTS.md)
- [API Documentation](./apps/docs/content/api/)
- [SDK Documentation](./apps/docs/content/sdk/)

## License

[Business Source License 1.1](./LICENSE.md)
