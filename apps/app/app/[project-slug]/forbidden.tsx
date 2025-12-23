import { Ban } from "lucide-react";
import { LayoutDashboardIcon } from "lucide-react";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import Link from "next/link";

export function Forbidden() {
  return (
    <Empty className="flex h-full min-h-[calc(90vh-4rem)] items-center justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ban />
        </EmptyMedia>
        <EmptyTitle>Access Denied</EmptyTitle>
        <EmptyDescription>
          You don&apos;t have the necessary permissions to access this page.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <LayoutDashboardIcon />
          Go to Dashboard
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export default Forbidden;
