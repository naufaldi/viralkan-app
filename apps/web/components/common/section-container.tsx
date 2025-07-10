import { cn } from "@repo/ui/lib/utils";
import React from "react";

const SectionContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "py-16 sm:py-24 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </section>
  );
};

export default SectionContainer; 