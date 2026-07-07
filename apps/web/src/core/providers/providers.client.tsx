"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import { Suspense } from "react";
import type { ReactNode } from "react";

import { Loader } from "@/core/components/ui";
import { AppAriaProvider } from "@/core/providers/aria/provider.client";
import { Devtools } from "@/core/providers/devtools.client";
import { AppEvlogProvider } from "@/core/providers/evlog.client";
import { AppQueryProvider } from "@/core/providers/query/provider.client";
import { AppToastProvider } from "@/core/providers/toast/provider.client";
import { WebVitals } from "@/core/providers/web-vitals.client";

export function AppProviders({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  return (
    <>
      <AppEvlogProvider>
        <AppAriaProvider locale={locale}>
          <AppToastProvider>
            <AppQueryProvider>
              <Suspense
                fallback={<Loader className="size-4.5" variant="spin" />}
              >
                {children}

                <Devtools />
              </Suspense>
            </AppQueryProvider>
          </AppToastProvider>
        </AppAriaProvider>
      </AppEvlogProvider>

      <WebVitals />
    </>
  );
}
