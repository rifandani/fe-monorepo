import type { ReactNode } from "react";

/** A wrapping row that lays out sibling variants with consistent spacing. */
export const VariantGrid = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-end gap-x-6 gap-y-4">{children}</div>
);

/** A single labeled example within a Component Entry. */
export const Variant = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col items-start gap-2">
    <span className="font-mono text-muted-fg text-xs">{label}</span>
    {children}
  </div>
);
