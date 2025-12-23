import { ApiConfigButton } from "@/components/api-config-button";
import { ApiPath } from "@/components/api-route";
import { BlockLink } from "@/components/block-link";
import { CodeBlock } from "@/components/code-block";
import { ComparisonTable } from "@/components/comparison-table";
import { CopyMarkdown } from "@/components/copy-markdown";
import { CurlCommand } from "@/components/curl-command";
import { EditOnGitHub } from "@/components/edit-on-github";
import { EnvVars } from "@/components/env-vars";
import { Faq } from "@/components/faq";
import { FootNotes } from "@/components/footnotes";
import { HeadingAnchor } from "@/components/heading-anchor";
import { InlineRoute, InlineRouteLink } from "@/components/inline-route";
import { InstallationTabs } from "@/components/installation-tabs";
import { MethodSignature } from "@/components/method-signature";
import { OpenIn } from "@/components/open-in";
import { PageNavigation } from "@/components/page-navigation";
import { Step, StepContent, Steps } from "@/components/steps";
import { TableOfContents, TocHeading } from "@/components/table-of-contents";
import { TestableApiProvider } from "@/components/testable-api-provider";
import {
  ApiMethodTable,
  ErrorTable,
  LanguageTable,
  TypeTable,
} from "@/components/type-table";
import { WebhookBuilder } from "@/components/webhook-builder";
import { getPageImage } from "@/lib/content";
import { GITHUB_DOCS_URL } from "@/lib/info";
import { generateUniqueId, textToId } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { Input } from "@simplist/ui/components/input";
import { Separator } from "@simplist/ui/components/separator";
import { Skeleton } from "@simplist/ui/components/skeleton";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { join } from "path";
import { ComponentType, FC } from "react";

const createHeadingComponents = (
  headings: TocHeading[],
): Record<string, ComponentType<any>> => {
  const textToIdMap = new Map<string, string[]>();

  headings.forEach(({ text, id }) => {
    const existing = textToIdMap.get(text) || [];
    existing.push(id);
    textToIdMap.set(text, existing);
  });

  const usageCount = new Map<string, number>();

  const getIdForText = (text: string): string => {
    const ids = textToIdMap.get(text);
    if (!ids || ids.length === 0) {
      return textToId(text);
    }

    const currentCount = usageCount.get(text) || 0;
    const id = ids[currentCount] || ids[0];
    usageCount.set(text, currentCount + 1);

    return id;
  };

  return {
    h1: (props: any) => {
      const id = props.children
        ? getIdForText(String(props.children))
        : undefined;
      return (
        <HeadingAnchor
          id={id}
          level={1}
          className="mb-8 text-4xl font-bold"
          {...props}
        />
      );
    },
    h2: (props: any) => {
      const id = props.children
        ? getIdForText(String(props.children))
        : undefined;
      return (
        <HeadingAnchor
          id={id}
          level={2}
          className="mt-10 mb-4 text-2xl font-semibold"
          {...props}
        />
      );
    },
    h3: (props: any) => {
      const id = props.children
        ? getIdForText(String(props.children))
        : undefined;
      return (
        <HeadingAnchor
          id={id}
          level={3}
          className="mt-12 mb-2 text-xl font-semibold"
          {...props}
        />
      );
    },
  };
};

const createSeparatedComponent = <T,>(
  Component: ComponentType<T>,
  displayName: string,
): ComponentType<T> => {
  const WrappedComponent = (props: any) => (
    <div
      className="mb-2 [&+div[data-component]]:mt-6"
      data-component={displayName}
    >
      <Component {...props} />
    </div>
  );

  WrappedComponent.displayName = `Separated(${displayName})`;
  return WrappedComponent;
};

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
  InstallationTabs: createSeparatedComponent(
    InstallationTabs,
    "InstallationTabs",
  ),
  EnvVars: createSeparatedComponent(EnvVars, "EnvVars"),
  TypeTable: createSeparatedComponent(TypeTable, "TypeTable"),
  ApiMethodTable: createSeparatedComponent(ApiMethodTable, "ApiMethodTable"),
  ErrorTable: createSeparatedComponent(ErrorTable, "ErrorTable"),
  LanguageTable: createSeparatedComponent(LanguageTable, "LanguageTable"),
  Steps: createSeparatedComponent(Steps, "Steps"),
  Step: createSeparatedComponent(Step, "Step"),
  StepContent: createSeparatedComponent(StepContent, "StepContent"),
  CurlCommand: createSeparatedComponent(CurlCommand, "CurlCommand"),
  MethodSignature: createSeparatedComponent(MethodSignature, "MethodSignature"),
  Faq: createSeparatedComponent(Faq, "Faq"),
  FootNotes: createSeparatedComponent(FootNotes, "FootNotes"),
  WebhookBuilder: createSeparatedComponent(WebhookBuilder, "WebhookBuilder"),
  ComparisonTable: createSeparatedComponent(ComparisonTable, "ComparisonTable"),
  InlineRoute,
  InlineRouteLink,
  p: (props: any) => <p className="mb-4" {...props} />,
  ul: (props: any) => (
    <ul className="mb-4 list-inside list-disc space-y-1" {...props} />
  ),
  ol: (props: any) => (
    <ol className="mb-4 list-inside list-decimal space-y-1" {...props} />
  ),
  li: (props: any) => <li {...props} />,
  code: (props: any) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre className="bg-muted mb-4 overflow-x-auto rounded-lg p-4" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-muted-foreground mb-4 border-l-4 pl-4 italic"
      {...props}
    />
  ),
  a: (props: any) => (
    <Link className="text-primary hover:text-primary/80 underline" {...props} />
  ),
  table: (props: any) => (
    <div className="mb-4 overflow-x-auto">
      <Table {...props} />
    </div>
  ),
  thead: (props: any) => <TableHeader {...props} />,
  tbody: (props: any) => <TableBody {...props} />,
  tr: (props: any) => <TableRow {...props} />,
  th: (props: any) => (
    <TableHead className="font-medium whitespace-nowrap" {...props} />
  ),
  td: (props: any) => <TableCell {...props} />,
  hr: () => <Separator className="mt-10" />,
};

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

const CONTENT_ROOTS = [
  join(process.cwd(), "apps", "docs", "content"),
  join(process.cwd(), "content"),
];

const buildPossiblePaths = (slug: string[]): string[] => {
  const slugPath = join(...slug);
  return CONTENT_ROOTS.flatMap((root) => [
    join(root, `${slugPath}.mdx`),
    join(root, slugPath, "index.mdx"),
  ]);
};

const readMdxFile = async (slug: string[]): Promise<string> => {
  const possiblePaths = buildPossiblePaths(slug);

  for (const contentPath of possiblePaths) {
    if (!existsSync(contentPath)) continue;

    try {
      const content = await readFile(contentPath, "utf-8");
      return content;
    } catch {
      continue;
    }
  }

  return "";
};

const getMdxContent = async (slug: string[]) => {
  const rawContent = await readMdxFile(slug);

  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (match) {
    return match[2];
  }

  return rawContent;
};

const getMdxFrontmatter = async (
  slug: string[],
): Promise<{ category?: string; title?: string }> => {
  const rawContent = await readMdxFile(slug);

  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const frontmatterMatch = rawContent.match(frontmatterRegex);

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const categoryMatch = frontmatter.match(/category:\s*(.+)/i);
    const titleMatch = frontmatter.match(/title:\s*(.+)/i);

    return {
      category: categoryMatch
        ? categoryMatch[1].replace(/^[""]|[""]$/g, "").trim()
        : undefined,
      title: titleMatch
        ? titleMatch[1].replace(/^[""]|[""]$/g, "").trim()
        : undefined,
    };
  }

  return {};
};

const getMdxMetadata = async (slug: string[]): Promise<Metadata> => {
  const rawContent = await readMdxFile(slug);

  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const frontmatterMatch = rawContent.match(frontmatterRegex);

  let title = slug[slug.length - 1] || "Documentation";
  let description = "Documentation for Simplist";

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/i);
    const descMatch = frontmatter.match(/description:\s*(.+)/i);

    if (titleMatch) title = titleMatch[1].replace(/^[""]|[""]$/g, "").trim();
    if (descMatch)
      description = descMatch[1].replace(/^[""]|[""]$/g, "").trim();

    if (title.includes("/") && title.includes(":")) {
      title = description;
    }
  } else {
    const h1Match = rawContent.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1];
  }

  return {
    title: `${title} | Simplist Documentation`,
    description,
    keywords: [
      "simplist",
      "documentation",
      "api",
      "sdk",
      "rest",
      "content",
      "management",
      "blog",
    ],
    openGraph: {
      title: `${title} | Simplist Documentation`,
      description,
      images: getPageImage(slug).url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Simplist Documentation`,
      description,
      images: getPageImage(slug).url,
    },
  };
};

const extractHeadings = (content: string): TocHeading[] => {
  const headingRegex = /^(#{1,2})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 1 | 2;
    const text = match[2].trim();
    const id = generateUniqueId(text, usedIds);

    headings.push({ id, text, level });
  }

  return headings;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug = [] } = await params;
  const contentPath = slug.length === 0 ? ["index"] : slug;
  return getMdxMetadata(contentPath);
};

const ContentPage: FC<PageProps> = async ({ params }) => {
  const { slug = [] } = await params;

  const contentPath = slug.length === 0 ? ["index"] : slug;

  const rawContent = await readMdxFile(contentPath);
  const content = await getMdxContent(contentPath);

  const headings = extractHeadings(content);

  const headingComponents = createHeadingComponents(headings);

  const components = {
    ...staticComponents,
    ...headingComponents,
  };

  const frontmatter = (await getMdxFrontmatter(contentPath)) ?? {};

  const currentHref =
    contentPath.length === 0 ||
    (contentPath.length === 1 && contentPath[0] === "index")
      ? "/"
      : `/${contentPath.join("/")}`;

  const githubPath = contentPath.join("/");
  const githubUrl = `${GITHUB_DOCS_URL}/${githubPath}.mdx`;
  const markdownUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}${currentHref}.mdx`;

  return (
    <TestableApiProvider>
      <div className="container mx-auto flex min-h-screen w-full items-start justify-center gap-8 overflow-x-hidden px-4">
        <main className="w-full max-w-3xl min-w-0 flex-1 overflow-x-hidden">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
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
            <MDXRemote source={content} components={components} />
          </div>

          <div className="mt-8 flex flex-row items-center justify-between border-t py-4">
            <EditOnGitHub githubUrl={githubUrl} />
          </div>

          <PageNavigation currentHref={currentHref} />
        </main>

        <TableOfContents headings={headings} />
      </div>
    </TestableApiProvider>
  );
};

export default ContentPage;
