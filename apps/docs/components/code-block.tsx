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
      <Card className="p-[2.5px] rounded-2xl">
        <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
          <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b min-w-0">
            <div className="flex items-center gap-2 overflow-hidden">
              {lang && languages.find((l) => l.value === lang)?.icon}

              <code className="text-muted-foreground text-sm truncate">
                {filename}
              </code>
            </div>

            <CopyButton content={code} />
          </div>

          <div className="overflow-x-auto max-w-full -mt-2.5">
            <div
              className="[&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:max-w-full [&_pre]:overflow-x-auto"
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
