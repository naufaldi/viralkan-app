import * as React from "react";

import { cn } from "@repo/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-4 py-3 text-base text-foreground transition-all duration-150 outline-none",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus:border-ring focus:ring-2 focus:ring-ring/20 hover:border-strong",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "md:text-sm md:h-10 md:py-2",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
