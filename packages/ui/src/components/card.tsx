"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@simplist/ui/lib/utils";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
  {
    variants: {
      variant: {
        default: "gap-3 py-5",
        form: "gap-3 pb-0",
        "form-danger": "gap-3 pb-0 border-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type CardVariant = "default" | "form" | "form-danger";

interface CardProps
  extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
  {
    variants: {
      variant: {
        default: "",
        form: "pt-5",
        "form-danger": "pt-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface CardHeaderProps extends React.ComponentProps<"div"> {
  variant?: CardVariant;
}

function CardHeader({ className, variant, ...props }: CardHeaderProps) {
  const parentVariant = React.useContext(CardContext);
  const finalVariant: CardVariant = variant || parentVariant || "default";

  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ variant: finalVariant }), className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

const cardContentVariants = cva("px-5", {
  variants: {
    variant: {
      default: "",
      form: "py-2.5 pb-2.5 pt-2!",
      "form-danger": "py-2.5 pb-2.5 pt-2!",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface CardContentProps extends React.ComponentProps<"div"> {
  variant?: CardVariant;
}

function CardContent({ className, variant, ...props }: CardContentProps) {
  const parentVariant = React.useContext(CardContext);
  const finalVariant: CardVariant = variant || parentVariant || "default";

  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ variant: finalVariant }), className)}
      {...props}
    />
  );
}

const cardFooterVariants = cva("flex items-center px-5", {
  variants: {
    variant: {
      default: "",
      form: "justify-between bg-muted/50 rounded-b-xl py-2.5 border-t",
      "form-danger":
        "justify-between bg-destructive/5 rounded-b-xl border-t border-destructive/20 py-2.5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface CardFooterProps extends React.ComponentProps<"div"> {
  variant?: CardVariant;
}

function CardFooter({ className, variant, ...props }: CardFooterProps) {
  const parentVariant = React.useContext(CardContext);
  const finalVariant: CardVariant = variant || parentVariant || "default";

  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ variant: finalVariant }), className)}
      {...props}
    />
  );
}

const CardContext = React.createContext<CardVariant | undefined>(undefined);

const CardWithContext = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant, children, ...props }, ref) => {
    return (
      <CardContext.Provider value={variant || undefined}>
        <Card ref={ref} variant={variant} {...props}>
          {children}
        </Card>
      </CardContext.Provider>
    );
  },
);
CardWithContext.displayName = "Card";

export {
  CardWithContext as Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
