import { useAtomValue } from "@effect/atom-react";
import { twJoin } from "cn";
import type { CSSProperties, PropsWithChildren } from "react";
import { Toaster } from "sonner";

import { persistence } from "@/lib/layers/persistence";

const toasterStyle: CSSProperties & Record<`--${string}`, string> = {
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
};

const toastClassName = twJoin(
  "will-change-transform not-has-data-[slot=note]:backdrop-blur-3xl *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1 *:data-[slot=note]:relative *:data-[slot=note]:z-50",
  "**:data-action:[--normal-bg:var(--color-primary-foreground)] **:data-action:[--normal-text:var(--color-primary)]"
);

export const AppToastProvider = ({ children }: PropsWithChildren) => {
  const theme = useAtomValue(persistence.themeAtom);

  return (
    <>
      {children}
      <Toaster
        className="toaster group"
        duration={3000}
        position="bottom-right"
        richColors
        style={toasterStyle}
        theme={theme}
        toastOptions={{ className: toastClassName }}
      />
    </>
  );
};
