import { FileText } from "@gravity-ui/icons";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import Link from "next/link";
import { FC } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted/50 mb-6 flex size-16 items-center justify-center rounded-full">
        <FileText className="text-muted-foreground size-8" />
      </div>

      <h3
        className="mb-2 text-xl font-semibold text-balance"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {title}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md text-pretty">
        {description}
      </p>

      {(actionLabel && actionHref) || onAction ? (
        actionHref ? (
          <Link className={buttonVariants({ variant: "default" })} href={actionHref as string}>
            {actionLabel}
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      ) : null}
    </div>
  );
};
