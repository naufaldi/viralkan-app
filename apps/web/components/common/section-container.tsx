import { cn } from "@repo/ui/lib/utils";
import { ReactNode } from "react";

const SectionContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn("px-4 py-16 sm:px-6 sm:py-24 lg:px-8", className)}>
      {children}
    </section>
  );
};

export default SectionContainer;
