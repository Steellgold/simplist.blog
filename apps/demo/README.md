# Simplist Blog Demo

This is a demo application showcasing how to use the Simplist.blog SDK to build a multilingual blog with Next.js.

## Features

- ✅ List articles with pagination
- ✅ Display individual articles with full content
- ✅ **Markdown rendering** with GitHub Flavored Markdown support
- ✅ Multilingual support (EN/FR) with variant handling
- ✅ Article metadata (author, tags, read time, views)
- ✅ Simple and clean UI with Tailwind CSS
- ✅ SEO-friendly URLs
- ✅ Responsive design

## Getting Started

### 1. Configure Environment Variables

Create a `.env.local` file in the `apps/demo` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Simplist API credentials:

```env
SIMPLIST_API_KEY=prj_your_api_key_here
SIMPLIST_BASE_URL=http://localhost:4000
SIMPLIST_PATH=blog
```

### 2. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

### 3. Run the Development Server

```bash
pnpm --filter @simplist/demo run dev
```

Or from the `apps/demo` directory:

```bash
npm run dev
```

The demo app will be available at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
apps/demo/
├── app/
│   ├── article/
│   │   └── [slug]/
│   │       └── page.tsx      # Article detail page
│   └── page.tsx               # Home page (article list)
├── lib/
│   └── simplist.ts            # Simplist SDK configuration
├── .env.example               # Environment variables example
└── package.json
```

## SDK Features Demonstrated

### Article Listing

```typescript
const response = await simplist.articles.published({
  limit: 20,
  sort: "publishedAt",
  order: "desc",
});
const articles = response.data;
```

### Article Detail

```typescript
const response = await simplist.articles.get(slug);
const article = response.data;
```

### Multilingual Support

```typescript
import { getVariantOrDefault } from "@simplist.blog/sdk";

// Get article content in the selected language
const variant = getVariantOrDefault(article, locale, DEFAULT_LOCALE);
```

## Customization

### Adding More Languages

Edit `lib/simplist.ts` and add more locales:

```typescript
export const SUPPORTED_LOCALES = ["en", "fr", "es", "de"] as const;
```

### Styling

The demo uses Tailwind CSS for styling. You can customize the design by editing the component files in `app/`.

### Adding Analytics

To track article views with Simplist Analytics:

```typescript
await simplist.analytics.track({
  articleSlug: article.slug,
  timeOnPage: 120,
  scrollDepth: 75,
});
```

## Learn More

- [Simplist Documentation](https://simplist.blog/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
