import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white shadow-button hover:bg-neutral-800 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-button focus-visible:ring-neutral-900/30",
        destructive:
          "bg-red-600 text-white shadow-button hover:bg-red-700 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-button focus-visible:ring-red-600/30",
        outline:
          "border border-neutral-300 bg-white text-neutral-900 shadow-button hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-button focus-visible:ring-neutral-900/20",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-button hover:bg-neutral-200 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-button focus-visible:ring-neutral-900/20",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150",
        link: "text-neutral-900 underline-offset-4 hover:underline transition-colors duration-150",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-5",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-md px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
