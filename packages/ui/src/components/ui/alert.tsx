import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "bg-red-50 border-red-200 text-red-800 [&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
        success:
          "bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
        warning:
          "bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-600 *:data-[slot=alert-description]:text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
