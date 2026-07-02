"use client";
import { createContext, use, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import type { MenuContentProps } from "./menu";
import {
  MenuContent,
  MenuDescription,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuShortcut,
} from "./menu";

interface ContextMenuTriggerContextType {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  contextMenuOffset: {
    offset: number;
    crossOffset: number;
  } | null;
  setContextMenuOffset: React.Dispatch<
    React.SetStateAction<{
      offset: number;
      crossOffset: number;
    } | null>
  >;
}
const ContextMenuTriggerContext = createContext<
  ContextMenuTriggerContextType | undefined
>(undefined);
const useContextMenuTrigger = () => {
  const context = use(ContextMenuTriggerContext);
  if (!context) {
    throw new Error(
      "useContextMenuTrigger must be used within a ContextMenuTrigger"
    );
  }
  return context;
};
interface ContextMenuProps {
  children: React.ReactNode;
}
const ContextMenu = ({ children }: ContextMenuProps) => {
  const [contextMenuOffset, setContextMenuOffset] = useState<{
    offset: number;
    crossOffset: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <ContextMenuTriggerContext
      value={{ buttonRef, contextMenuOffset, setContextMenuOffset }}
    >
      {children}
    </ContextMenuTriggerContext>
  );
};
type ContextMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
const ContextMenuTrigger = ({
  className,
  ...props
}: ContextMenuTriggerProps) => {
  const { buttonRef, setContextMenuOffset } = useContextMenuTrigger();
  const onContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuOffset({
      crossOffset: e.clientX - rect.left,
      offset: e.clientY - rect.bottom,
    });
  };
  return (
    <button
      className={twMerge(
        "cursor-default focus:outline-hidden disabled:opacity-60 disabled:forced-colors:disabled:text-[GrayText]",
        className
      )}
      ref={buttonRef}
      aria-haspopup="menu"
      onContextMenu={onContextMenu}
      {...props}
    />
  );
};
type ContextMenuContentProps<T> = Omit<
  MenuContentProps<T>,
  | "arrow"
  | "isOpen"
  | "onOpenChange"
  | "triggerRef"
  | "placement"
  | "shouldFlip"
>;
const ContextMenuContent = <T extends object>(
  props: ContextMenuContentProps<T>
) => {
  const { contextMenuOffset, setContextMenuOffset, buttonRef } =
    useContextMenuTrigger();
  return contextMenuOffset ? (
    <MenuContent
      popover={{
        crossOffset: contextMenuOffset.crossOffset,
        isOpen: !!contextMenuOffset,
        offset: contextMenuOffset.offset,
        onOpenChange: () => setContextMenuOffset(null),
        placement: "bottom left",
        shouldFlip: false,
        triggerRef: buttonRef,
      }}
      onClose={() => setContextMenuOffset(null)}
      {...props}
    />
  ) : null;
};
const ContextMenuItem = MenuItem;
const ContextMenuSeparator = MenuSeparator;
const ContextMenuDescription = MenuDescription;
const ContextMenuSection = MenuSection;
const ContextMenuHeader = MenuHeader;
const ContextMenuShortcut = MenuShortcut;
const ContextMenuLabel = MenuLabel;
export type { ContextMenuProps };
export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuDescription,
  ContextMenuHeader,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSection,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
};
