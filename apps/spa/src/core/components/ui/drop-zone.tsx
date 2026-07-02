"use client";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { DropZoneProps } from "react-aria-components/DropZone";
import { DropZone as DropPrimitiveZone } from "react-aria-components/DropZone";
import { twMerge } from "tailwind-merge";

export const DropZone = ({ className, ...props }: DropZoneProps) => (
  <DropPrimitiveZone
    className={composeRenderProps(
      className,
      (renderClassName, { isDropTarget }) =>
        twMerge(
          "group/drop-zone relative z-10 flex max-h-56 items-center justify-center overflow-hidden rounded-lg border border-dashed p-6",
          isDropTarget &&
            "border-solid border-primary bg-primary/10 ring-3 ring-ring/20",
          renderClassName
        )
    )}
    {...props}
  />
);
