import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/lib/blog/mdx-components";
import { FC } from "react";

type Props = {
  content: string;
};

export const ArticleContent: FC<Props> = async ({ content }) => {
  return (
    <div className="prose prose-neutral dark:prose-invert prose-headings:font-syne prose-headings:font-bold prose-a:text-primary max-w-none">
      <MDXRemote source={content} components={mdxComponents} />
    </div>
  );
}
