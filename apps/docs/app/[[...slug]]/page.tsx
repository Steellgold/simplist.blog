import { BlockLink } from "@/components/block-link"
import { CopyMarkdown } from "@/components/copy-markdown"
import { EditOnGitHub } from "@/components/edit-on-github"
import { OpenIn } from "@/components/open-in"
import { PageNavigation } from "@/components/page-navigation"
import { Alert, AlertDescription, AlertTitle } from "@simplist/ui/components/alert"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Input } from "@simplist/ui/components/input"
import { Separator } from "@simplist/ui/components/separator"
import { Skeleton } from "@simplist/ui/components/skeleton"
import { Spinner } from "@simplist/ui/components/spinner"
import { readFile } from "fs/promises"
import * as LucideIcons from "lucide-react"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { join } from "path"
import { FC } from "react"

const components = {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  
  Button,
  
  Badge,
  
  Alert,
  AlertTitle,
  AlertDescription,
  
  Input,
  
  Separator,
  Skeleton,
  Spinner,
  
  BlockLink,
  
  ...Object.fromEntries(Object.entries(LucideIcons).map(([key, value]) => [key, value as React.ComponentType<any>])),
  
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-6 text-4xl font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-4 mt-8 text-2xl font-semibold" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-3 mt-6 text-xl font-semibold" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 list-inside list-disc space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 list-inside list-decimal space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mb-4 border-l-4 border-muted-foreground pl-4 italic" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary underline hover:text-primary/80" {...props} />
  ),
}

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

async function readMdxFile(slug: string[]): Promise<string> {
  const possiblePaths = [
    join(process.cwd(), "apps", "docs", "content", ...slug) + ".mdx",
    join(process.cwd(), "content", ...slug) + ".mdx",
  ]
  
  for (const contentPath of possiblePaths) {
    try {
      const content = await readFile(contentPath, "utf-8")
      return content
    } catch (error) {
      continue
    }
  }
  
  return ""
}

async function getMdxContent(slug: string[]) {
  const rawContent = await readMdxFile(slug)
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = rawContent.match(frontmatterRegex)
  
  if (match) {
    return match[2]
  }
  
  return rawContent
}

async function getMdxFrontmatter(slug: string[]): Promise<{ category?: string; title?: string }> {
  const rawContent = await readMdxFile(slug)
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const frontmatterMatch = rawContent.match(frontmatterRegex)
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const categoryMatch = frontmatter.match(/category:\s*(.+)/i)
    const titleMatch = frontmatter.match(/title:\s*(.+)/i)
    
    return {
      category: categoryMatch ? categoryMatch[1].replace(/^["']|["']$/g, "").trim() : undefined,
      title: titleMatch ? titleMatch[1].replace(/^["']|["']$/g, "").trim() : undefined,
    }
  }
  
  return {}
}

async function getMdxMetadata(slug: string[]): Promise<Metadata> {
  const rawContent = await readMdxFile(slug)

  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const frontmatterMatch = rawContent.match(frontmatterRegex)

  let title = slug[slug.length - 1] || "Documentation"
  let description = "Documentation for Simplist"

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const titleMatch = frontmatter.match(/title:\s*(.+)/i)
    const descMatch = frontmatter.match(/description:\s*(.+)/i)

    if (titleMatch) title = titleMatch[1].replace(/^["']|["']$/g, "").trim()
    if (descMatch) description = descMatch[1].replace(/^["']|["']$/g, "").trim()
  } else {
    const h1Match = rawContent.match(/^#\s+(.+)$/m)
    if (h1Match) title = h1Match[1]
  }

  return {
    title: `${title} | Simplist Documentation`,
    description,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const contentPath = slug.length === 0 ? ["index"] : slug
  return getMdxMetadata(contentPath)
}

const ContentPage: FC<PageProps> = async ({ params }) => {
  const { slug = [] } = await params

  const contentPath = slug.length === 0 ? ["index"] : slug

  const rawContent = await readMdxFile(contentPath)
  const content = await getMdxContent(contentPath)

  const frontmatter = await getMdxFrontmatter(contentPath) ?? {}

  const currentHref = contentPath.length === 0 || (contentPath.length === 1 && contentPath[0] === "index") ? "/" : `/${contentPath.join("/")}`

  const githubPath = contentPath.join("/")
  const githubUrl = `https://github.com/Steellgold/simplist/tree/docs/apps/docs/content/${githubPath}.mdx`
  const markdownUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}${currentHref}.mdx`

  return (
    <main className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-end gap-2">
        <CopyMarkdown content={rawContent} />
        <OpenIn githubUrl={githubUrl} markdownUrl={markdownUrl} />
      </div>

      {frontmatter.category && (
        <Badge variant="secondary" className="mb-4">
          {frontmatter.category}
        </Badge>
      )}

      <MDXRemote
        source={content}
        components={components}
      />

      <div className="mt-8 py-4 flex flex-row items-center justify-between">
        <EditOnGitHub githubUrl={githubUrl} />
      </div>

      <PageNavigation currentHref={currentHref} />
    </main>
  )
}

export default ContentPage;