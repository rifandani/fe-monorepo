import { useLocalStorage } from "@reactuses/core";
import { useResetState } from "@workspace/core/hooks/use-reset-state";
import { twJoin } from "cn";
import { createContext } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import type { Toaster } from "sonner";

import type { ColorMode } from "@/core/constants/global";
import { COLOR_MODE_STORAGE_KEY } from "@/core/constants/global";

type ToastContextInterface = ReturnType<typeof useCreateToastContext>;

type ToasterProps = ComponentPropsWithoutRef<typeof Toaster>;

export const useCreateToastContext = () => {
  // `Entry` owns applying the mode to `<html>`; this only needs to read it back
  const [colorMode] = useLocalStorage<ColorMode>(
    COLOR_MODE_STORAGE_KEY,
    "auto"
  );

  const theme = colorMode ?? "auto";

  const [toastConfig, setToastConfig, resetToastConfig] =
    useResetState<ToasterProps>({
      className: "toaster group",
      duration: 3000,
      position: "bottom-right",
      richColors: true,
      // SAFETY: sonner forwards `style` to the DOM, so the custom properties below
      // are valid CSS - React's `CSSProperties` just does not model them.
      style: {
        "--error-bg": "var(--color-danger-subtle)",
        "--error-border":
          "color-mix(in oklab, var(--danger-subtle-foreground) 20%, transparent)",
        "--error-text": "var(--color-danger-subtle-foreground)",
        "--info-bg": "var(--color-info-subtle)",
        "--info-border":
          "color-mix(in oklab, var(--info-subtle-foreground) 20%, transparent)",
        "--info-text": "var(--color-info-subtle-foreground)",
        "--normal-bg": "var(--color-overlay)",
        "--normal-border": "var(--color-border)",
        "--normal-text": "var(--color-overlay-foreground)",
        "--success-bg": "var(--color-success-subtle)",
        "--success-border":
          "color-mix(in oklab, var(--success-subtle-foreground) 20%, transparent)",
        "--success-text": "var(--color-success-subtle-foreground)",
        "--warning-bg": "var(--color-warning-subtle)",
        "--warning-border":
          "color-mix(in oklab, var(--warning-subtle-foreground) 20%, transparent)",
        "--warning-text": "var(--color-warning-subtle-foreground)",
      } as CSSProperties,
      theme: theme === "auto" ? "system" : theme,
      toastOptions: {
        className: twJoin(
          "will-change-transform not-has-data-[slot=note]:backdrop-blur-3xl *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1 *:data-[slot=note]:relative *:data-[slot=note]:z-50",
          "**:data-action:[--normal-bg:var(--color-primary-foreground)] **:data-action:[--normal-text:var(--color-primary)]"
        ),
      },
    });

  const actions = {
    resetToastConfig,
    setToastConfig,
  };

  return [toastConfig, actions] as const;
};

export const ToastContext = createContext<ToastContextInterface>(
  // SAFETY: the provider always supplies a real value; a consumer outside it is a
  // programming error rather than a supported state.
  {} as ToastContextInterface
);
