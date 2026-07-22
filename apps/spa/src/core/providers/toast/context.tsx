import { useColorMode } from "@workspace/core/hooks/use-color-mode";
import { useResetState } from "@workspace/core/hooks/use-reset-state";
import { createContext } from "react";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import type { Toaster } from "sonner";
import { twJoin } from "tailwind-merge";

export type ToastContextInterface = ReturnType<typeof useCreateToastContext>;
type ToasterProps = ComponentPropsWithoutRef<typeof Toaster>;
export const useCreateToastContext = () => {
  const [theme] = useColorMode();
  const [toastConfig, setToastConfig, resetToastConfig] =
    useResetState<ToasterProps>({
      className: "toaster group",
      duration: 3000,
      position: "bottom-right",
      richColors: true,
      style: {
        "--error-bg": "var(--color-danger-subtle)",
        "--error-border":
          "color-mix(in oklab, var(--danger-subtle-fg) 20%, transparent)",
        "--error-text": "var(--color-danger-subtle-fg)",
        "--info-bg": "var(--color-info-subtle)",
        "--info-border":
          "color-mix(in oklab, var(--info-subtle-fg) 20%, transparent)",
        "--info-text": "var(--color-info-subtle-fg)",
        "--normal-bg": "var(--color-overlay)",
        "--normal-border": "var(--color-border)",
        "--normal-text": "var(--color-overlay-fg)",
        "--success-bg": "var(--color-success-subtle)",
        "--success-border":
          "color-mix(in oklab, var(--success-subtle-fg) 20%, transparent)",
        "--success-text": "var(--color-success-subtle-fg)",
        "--warning-bg": "var(--color-warning-subtle)",
        "--warning-border":
          "color-mix(in oklab, var(--warning-subtle-fg) 20%, transparent)",
        "--warning-text": "var(--color-warning-subtle-fg)",
      } as CSSProperties,
      theme: theme === "auto" ? "system" : theme,
      toastOptions: {
        className: twJoin(
          "will-change-transform not-has-data-[slot=note]:backdrop-blur-3xl *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1 *:data-[slot=note]:relative *:data-[slot=note]:z-50",
          "**:data-action:[--normal-bg:var(--color-primary-fg)] **:data-action:[--normal-text:var(--color-primary)]"
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
  {} as ToastContextInterface
);
