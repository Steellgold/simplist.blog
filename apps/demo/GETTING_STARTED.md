# Getting Started with the Demo App

This guide will help you set up and run the Simplist Blog Demo application.

## Prerequisites

1. **Start the Simplist API** (from the root of the monorepo):

   ```bash
   pnpm --filter @simplist/api run dev
   ```

   The API should be running at `http://localhost:4000`

2. **Create a project and get an API key** through the main Simplist Dashboard:
   - Go to `http://localhost:3000`
   - Create a new project or use an existing one
   - Generate an API key with read permissions
   - (Optional) Create some test articles with multilingual variants

## Setup

1. **Navigate to the demo app directory:**

   ```bash
   cd apps/demo
   ```

2. **Install dependencies** (if not already done):

   ```bash
   npm install
   # or from the root:
   pnpm install
   ```

3. **Configure environment variables:**

   Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API key:

   ```env
   SIMPLIST_API_KEY=prj_your_actual_api_key_here
   SIMPLIST_BASE_URL=http://localhost:4000
   SIMPLIST_PATH=blog
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

## Running the Demo

Start the development server:

```bash
npm run dev
# or from the root:
pnpm --filter @simplist/demo run dev
```

The demo app will be available at [http://localhost:3001](http://localhost:3001)

## Testing Features

### 1. View Articles List

- Go to `http://localhost:3001`
- You should see a list of your published articles

### 2. Multilingual Support

- Click on the language switcher (EN/FR) in the header
- Articles will display in the selected language if variants are available

### 3. View Article Details

- Click on any article to view its full content
- See metadata, tags, statistics, and available languages

### 4. Popular Tags

- Scroll down on the homepage to see popular tags
- Tags display with custom colors and icons if configured

### 5. RSS Feed

- Visit `http://localhost:3001/api/rss` to see the RSS feed

### 6. Sitemap

- Visit `http://localhost:3001/api/sitemap` to see the XML sitemap

## Creating Test Articles

If you don't have articles yet, create some through the Dashboard at `http://localhost:3000`:

1. Click "New Article"
2. Add a title and content
3. (Optional) Add tags with colors and icons
4. (Optional) Create language variants (FR, ES, etc.)
5. Publish the article
6. Refresh the demo app to see your new article

## Troubleshooting

### "No articles available"

- Make sure you have published articles in your project
- Check that your API key has read permissions
- Verify the API is running at `http://localhost:4000`

### "API key is required" error

- Check that your `.env.local` file exists and contains a valid API key
- Make sure the API key starts with `prj_`
- Restart the dev server after changing environment variables

### 404 errors during build

- This is normal if the API is not running during build time
- The routes are dynamic and will work when the API is available

### Language variants not showing

- Create language variants in the Dashboard for your articles
- Use the "Add Variant" button when editing an article
- Make sure variants are saved and the article is published

## Next Steps

- Customize the styling in `app/globals.css`
- Add more features from `lib/advanced-features.ts`
- Implement analytics tracking on article pages
- Create a search page using the search functions
- Add pagination for the article list
- Create a tag filter page

## Learn More

- [Simplist SDK Documentation](../../packages/sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
