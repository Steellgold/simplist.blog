import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import { Badge } from "@simplist/ui/components/badge";
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card";
import { Separator } from "@simplist/ui/components/separator";
import Link from "next/link";
import { ComponentProps } from "react";
import { CodeBlock } from "@/components/mdx/code-block";
import { cn } from "@/lib/utils";

export const mdxComponents = {
  // Code
  CodeBlock,

  // UI Components
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Card,
  CardHeader,
  CardContent,
  Separator,

  // HTML element overrides for prose
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mt-8 mb-4 scroll-mt-20 text-4xl font-bold" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-6 mb-3 scroll-mt-20 text-3xl font-bold" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-5 mb-2 scroll-mt-20 text-2xl font-bold" {...props} />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4 className="mt-4 mb-2 scroll-mt-20 text-xl font-bold" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-4 leading-7" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 ml-6 list-disc space-y-2" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props: ComponentProps<"li">) => <li className="leading-7" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="border-primary text-muted-foreground my-4 border-l-4 pl-4 italic"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre className="my-4 overflow-x-auto rounded-lg" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <Link
      href={props.href || "#"}
      className="text-primary font-medium hover:underline"
      {...props}
    >
      {props.children}
    </Link>
  ),
  hr: () => <Separator className="my-8" />,
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentProps<"thead">) => (
    <thead className="bg-muted" {...props} />
  ),
  tbody: (props: ComponentProps<"tbody">) => <tbody {...props} />,
  tr: (props: ComponentProps<"tr">) => (
    <tr className="hover:bg-muted/50 border-b transition-colors" {...props} />
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td
      className="px-4 py-2 [[align=center]]:text-center [[align=right]]:text-right"
      {...props}
    />
  ),
  img: (props: ComponentProps<"img">) => (
    <img className="my-6 rounded-lg" alt={props.alt || ""} {...props} />
  ),
};
