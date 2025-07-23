import * as React from "react";

import { cn } from "@repo/ui/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-background px-4 py-3 text-base text-foreground transition-all duration-150 outline-none resize-vertical",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus:border-ring focus:ring-2 focus:ring-ring/20 hover:border-strong",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "md:text-sm md:py-2",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
