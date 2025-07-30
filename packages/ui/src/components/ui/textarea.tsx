import * as React from "react";

import { cn } from "@repo/ui/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background text-foreground resize-vertical flex min-h-20 w-full rounded-md border px-4 py-3 text-base transition-all duration-150 outline-none",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "focus:border-ring focus:ring-ring/20 hover:border-strong focus:ring-2",
        "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2",
        "md:py-2 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
