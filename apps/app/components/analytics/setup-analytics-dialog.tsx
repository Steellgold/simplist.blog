"use client";

import { ArrowUpRightFromSquare, Code, FileCode } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@simplist/ui/components/item";
import Link from "next/link";

export const SetupAnalyticsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Setup Analytics</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup Analytics Tracking</DialogTitle>
          <DialogDescription>
            Choose how you want to implement analytics tracking for your
            articles
          </DialogDescription>
        </DialogHeader>

        <ItemGroup className="py-4">
          <Item variant="outline" asChild>
            <Link
              href="https://docs.simplist.blog/sdk/analytics"
              target="_blank"
            >
              <ItemMedia variant="icon">
                <Code />
              </ItemMedia>

              <ItemContent>
                <ItemTitle>SDK Implementation</ItemTitle>
                <ItemDescription>
                  Server-side tracking with TypeScript SDK. Best for Next.js,
                  React, and Node.js applications.
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                <ArrowUpRightFromSquare className="text-muted-foreground h-4 w-4" />
              </ItemActions>
            </Link>
          </Item>

          <Item variant="outline" asChild>
            <Link
              href="https://docs.simplist.blog/sdk/analytics-script"
              target="_blank"
            >
              <ItemMedia variant="icon">
                <FileCode />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Analytics Script</ItemTitle>
                <ItemDescription>
                  Drop-in script tag with zero configuration. Just add one line
                  of HTML to your site.
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                <ArrowUpRightFromSquare className="text-muted-foreground h-4 w-4" />
              </ItemActions>
            </Link>
          </Item>
        </ItemGroup>
      </DialogContent>
    </Dialog>
  );
};
