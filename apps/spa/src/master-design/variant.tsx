import { cn } from "cn";
import type { ReactNode } from "react";

/** A wrapping row that lays out sibling variants with consistent spacing. */
export const VariantGrid = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-start gap-x-6 gap-y-4">{children}</div>
);

/** A single labeled example within a Component Entry. */
export const Variant = ({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: ReactNode;
}) => (
  <div className={cn("flex flex-col items-start gap-2", className)}>
    <span className="text-muted-fg font-mono text-xs">{label}</span>
    {children}
  </div>
);
