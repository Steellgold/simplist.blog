import { FC } from "react";
import { Card } from "@simplist/ui/components/card";
import { cn } from "@/lib/utils";
import { highlightCode } from "@/lib/shiki";
import { CopyButton } from "@simplist/ui/components/copy-button";
import { CodeBlockTabsClient } from "./code-block-tabs-client";
import { BundledLanguage } from "shiki";
import { languages } from "@/lib/languages";

type CodeTab = {
  label: string;
  language: string;
  code: string;
  filename?: string;
};

type CodeBlockProps = {
  tabs?: CodeTab[];
  language?: string;
  filename?: string;
  className?: string;
} & React.ComponentProps<"pre">;

export const CodeBlock: FC<CodeBlockProps> = async ({
  tabs,
  language,
  filename,
  className,
  children,
}) => {
  const isSingleMode = !tabs && language && children;

  const code = children?.toString().trim();

  if (isSingleMode && language && code) {
    const highlighted = await highlightCode(code, language as BundledLanguage);
    const lang = language;

    return (
      <Card className="rounded-2xl p-[2.5px]">
        <Card className={cn("max-w-full overflow-hidden p-0", className)}>
          <div className="bg-muted/50 flex min-w-0 items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {lang && languages.find((l) => l.value === lang)?.icon}

              <code className="text-muted-foreground truncate text-sm">
                {filename}
              </code>
            </div>

            <CopyButton content={code} />
          </div>

          <div className="-mt-2.5 max-w-full overflow-x-auto">
            <div
              className="[&_pre]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-transparent [&_pre]:p-4"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        </Card>
      </Card>
    );
  }

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const highlightedTabs = await Promise.all(
    tabs.map(async (tab) => ({
      ...tab,
      highlighted: await highlightCode(
        tab.code,
        tab.language as BundledLanguage,
      ),
    })),
  );

  return <CodeBlockTabsClient tabs={highlightedTabs} className={className} />;
};
