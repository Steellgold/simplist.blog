import { ApiPath } from "@/components/api-route"
import { ApiConfigButton } from "@/components/api-config-button"
import { BlockLink } from "@/components/block-link"
import { CodeBlock } from "@/components/code-block"
import { InstallationTabs } from "@/components/installation-tabs"
import { CopyMarkdown } from "@/components/copy-markdown"
import { EditOnGitHub } from "@/components/edit-on-github"
import { EnvVars } from "@/components/env-vars"
import { HeadingAnchor } from "@/components/heading-anchor"
import { OpenIn } from "@/components/open-in"
import { PageNavigation } from "@/components/page-navigation"
import { TableOfContents, TocHeading } from "@/components/table-of-contents"
import { TestableApiProvider } from "@/components/testable-api-provider"
import { Alert, AlertDescription, AlertTitle } from "@simplist/ui/components/alert"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Input } from "@simplist/ui/components/input"
import { Separator } from "@simplist/ui/components/separator"
import { Skeleton } from "@simplist/ui/components/skeleton"
import { Spinner } from "@simplist/ui/components/spinner"
import { readFile } from "fs/promises"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import { join } from "path"
import { ComponentType, FC } from "react"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { textToId, generateUniqueId } from "@/lib/utils"
import Link from "next/link"

const createHeadingComponents = (headings: TocHeading[]): Record<string, ComponentType<any>> => {
  const textToIdMap = new Map<string, string[]>()
  
  headings.forEach(({ text, id }) => {
    const existing = textToIdMap.get(text) || []
    existing.push(id)
    textToIdMap.set(text, existing)
  })

  const usageCount = new Map<string, number>()

  const getIdForText = (text: string): string => {
    const ids = textToIdMap.get(text)
    if (!ids || ids.length === 0) {
      return textToId(text)
    }

    const currentCount = usageCount.get(text) || 0
    const id = ids[currentCount] || ids[0]
    usageCount.set(text, currentCount + 1)
    
    return id
  }

  return {
    h1: (props: any) => {
      const id = props.children ? getIdForText(String(props.children)) : undefined
      return <HeadingAnchor id={id} level={1} className="mb-6 text-4xl font-bold" {...props} />
    },
    h2: (props: any) => {
      const id = props.children ? getIdForText(String(props.children)) : undefined
      return <HeadingAnchor id={id} level={2} className="mb-4 mt-8 text-2xl font-semibold" {...props} />
    },
    h3: (props: any) => {
      const id = props.children ? getIdForText(String(props.children)) : undefined
      return <HeadingAnchor id={id} level={3} className="mb-3 mt-6 text-xl font-semibold" {...props} />
    },
  }
}

const createSeparatedComponent = <T,>(Component: ComponentType<T>, displayName: string): ComponentType<T> => {
  const WrappedComponent = (props: any) => (
    <div className="[&+div[data-component]]:mt-6 mb-2" data-component={displayName}>
      <Component {...props} />
    </div>
  )

  WrappedComponent.displayName = `Separated(${displayName})`
  return WrappedComponent
}

const staticComponents = {
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
  ApiPath: createSeparatedComponent(ApiPath, "ApiPath"),
  CodeBlock: createSeparatedComponent(CodeBlock, "CodeBlock"),
  InstallationTabs: createSeparatedComponent(InstallationTabs, "InstallationTabs"),
  EnvVars: createSeparatedComponent(EnvVars, "EnvVars"),
  p: (props: any) => (
    <p className="mb-4" {...props} />
  ),
  ul: (props: any) => (
    <ul className="mb-4 list-inside list-disc space-y-1" {...props} />
  ),
  ol: (props: any) => (
    <ol className="mb-4 list-inside list-decimal space-y-1" {...props} />
  ),
  li: (props: any) => (
    <li {...props} />
  ),
  code: (props: any) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="mb-4 border-l-4 border-muted-foreground pl-4 italic" {...props} />
  ),
  a: (props: any) => (
    <Link className="text-primary underline hover:text-primary/80" {...props} />
  ),
}

type PageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

const readMdxFile = async (slug: string[]): Promise<string> => {
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

const getMdxContent = async (slug: string[]) => {
  const rawContent = await readMdxFile(slug)
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = rawContent.match(frontmatterRegex)
  
  if (match) {
    return match[2]
  }
  
  return rawContent
}

const getMdxFrontmatter = async (slug: string[]): Promise<{ category?: string; title?: string }> => {
  const rawContent = await readMdxFile(slug)
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const frontmatterMatch = rawContent.match(frontmatterRegex)
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const categoryMatch = frontmatter.match(/category:\s*(.+)/i)
    const titleMatch = frontmatter.match(/title:\s*(.+)/i)
    
    return {
      category: categoryMatch ? categoryMatch[1].replace(/^[""]|[""]$/g, "").trim() : undefined,
      title: titleMatch ? titleMatch[1].replace(/^[""]|[""]$/g, "").trim() : undefined,
    }
  }
  
  return {}
}

const getMdxMetadata = async (slug: string[]): Promise<Metadata> => {
  const rawContent = await readMdxFile(slug)

  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const frontmatterMatch = rawContent.match(frontmatterRegex)

  let title = slug[slug.length - 1] || "Documentation"
  let description = "Documentation for Simplist"

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const titleMatch = frontmatter.match(/title:\s*(.+)/i)
    const descMatch = frontmatter.match(/description:\s*(.+)/i)

    if (titleMatch) title = titleMatch[1].replace(/^[""]|[""]$/g, "").trim()
    if (descMatch) description = descMatch[1].replace(/^[""]|[""]$/g, "").trim()
  } else {
    const h1Match = rawContent.match(/^#\s+(.+)$/m)
    if (h1Match) title = h1Match[1]
  }

  return {
    title: `${title} | Simplist Documentation`,
    description,
  }
}

const extractHeadings = (content: string): TocHeading[] => {
  const headingRegex = /^(#{1,2})\s+(.+)$/gm
  const headings: TocHeading[] = []
  const usedIds = new Set<string>()
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 1 | 2
    const text = match[2].trim()
    const id = generateUniqueId(text, usedIds)

    headings.push({ id, text, level })
  }

  return headings
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug = [] } = await params
  const contentPath = slug.length === 0 ? ["index"] : slug
  return getMdxMetadata(contentPath)
}

const ContentPage: FC<PageProps> = async ({ params }) => {
  const { slug = [] } = await params

  const contentPath = slug.length === 0 ? ["index"] : slug

  const rawContent = await readMdxFile(contentPath)
  const content = await getMdxContent(contentPath)
  
  const headings = extractHeadings(content)
  
  const headingComponents = createHeadingComponents(headings)
  
  const components = {
    ...staticComponents,
    ...headingComponents,
  }

  const frontmatter = await getMdxFrontmatter(contentPath) ?? {}

  const currentHref = contentPath.length === 0 || (contentPath.length === 1 && contentPath[0] === "index") ? "/" : `/${contentPath.join("/")}`

  const githubPath = contentPath.join("/")
  const githubUrl = `https://github.com/Steellgold/simplist.blog/tree/docs/apps/docs/content/${githubPath}.mdx`
  const markdownUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}${currentHref}.mdx`

  return (
    <TestableApiProvider>
      <div className="flex justify-center items-start gap-8 w-full min-h-screen container mx-auto px-4 overflow-x-hidden">
        <main className="flex-1 max-w-3xl w-full min-w-0 overflow-x-hidden">
          <div className="mb-6 flex items-center justify-end gap-2 flex-wrap">
            <ApiConfigButton />
            <ButtonGroup>
              <CopyMarkdown content={rawContent} />
              <OpenIn githubUrl={githubUrl} markdownUrl={markdownUrl} />
            </ButtonGroup>
          </div>

          {frontmatter.category && (
            <Badge variant="secondary" className="mb-4">
              {frontmatter.category}
            </Badge>
          )}

          <div className="max-w-full overflow-x-hidden">
            <MDXRemote
              source={content}
              components={components}
            />
          </div>

          <div className="mt-8 py-4 flex flex-row items-center justify-between border-t ">
            <EditOnGitHub githubUrl={githubUrl} />
          </div>

          <PageNavigation currentHref={currentHref} />
        </main>

        <TableOfContents headings={headings} />
      </div>
    </TestableApiProvider>
  )
}

export default ContentPage;