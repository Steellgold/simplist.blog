import { languages } from "@/lib/blog/languages";
import { highlightCode } from "@/lib/blog/shiki";
import { cn } from "@/lib/utils";
import { Card } from "@simplist/ui/components/card";
import { CopyButton } from "@simplist/ui/components/copy-button";
import { type ComponentProps, type FC } from "react";
import { BundledLanguage } from "shiki";

type CodeBlockProps = {
  language?: string;
  filename?: string;
  className?: string;
} & ComponentProps<"pre">;

export const CodeBlock: FC<CodeBlockProps> = async ({
  language,
  filename,
  className,
  children,
}) => {
  const code = children?.toString().trim();

  if (!language || !code) {
    return null;
  }

  const highlighted = await highlightCode(code, language as BundledLanguage);
  const lang = language;

  return (
    <Card className="my-6 rounded-2xl p-[2.5px]">
      <Card className={cn("max-w-full overflow-hidden p-0", className)}>
        <div className="bg-muted/50 flex min-w-0 items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {lang && languages.find((l) => l.value === lang)?.icon}

            {filename && (
              <code className="text-muted-foreground truncate text-sm">
                {filename}
              </code>
            )}
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
};
