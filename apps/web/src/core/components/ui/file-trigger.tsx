"use client";
import {
  CameraIcon,
  FolderIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import type { FileTriggerProps as FileTriggerPrimitiveProps } from "react-aria-components/FileTrigger";
import { FileTrigger as FileTriggerPrimitive } from "react-aria-components/FileTrigger";
import type { VariantProps } from "tailwind-variants";

import type { buttonStyles } from "./button";
import { Button } from "./button";
import { Loader } from "./loader";

export interface FileTriggerProps
  extends FileTriggerPrimitiveProps, VariantProps<typeof buttonStyles> {
  isDisabled?: boolean;
  isPending?: boolean;
  ref?: React.RefObject<HTMLInputElement>;
  className?: string;
}

const getFileTriggerIcon = (
  props: Pick<
    FileTriggerProps,
    "defaultCamera" | "acceptDirectory" | "isPending"
  >
) => {
  if (props.isPending) {
    return <Loader />;
  }
  if (props.defaultCamera) {
    return <CameraIcon />;
  }
  if (props.acceptDirectory) {
    return <FolderIcon />;
  }
  return <PaperClipIcon />;
};

const getBrowseLabel = (
  props: Pick<FileTriggerProps, "allowsMultiple" | "acceptDirectory">
) => {
  if (props.allowsMultiple) {
    return "Browse a files";
  }
  if (props.acceptDirectory) {
    return "Browse";
  }
  return "Browse a file";
};

export const FileTrigger = ({
  intent = "outline",
  size = "md",
  isCircle = false,
  ref,
  className,
  ...props
}: FileTriggerProps) => (
  <FileTriggerPrimitive ref={ref} {...props}>
    <Button
      className={className}
      isDisabled={props.isDisabled}
      intent={intent}
      size={size}
      isCircle={isCircle}
    >
      {getFileTriggerIcon(props)}
      {props.children ?? (
        <>
          {getBrowseLabel(props)}
          ...
        </>
      )}
    </Button>
  </FileTriggerPrimitive>
);
