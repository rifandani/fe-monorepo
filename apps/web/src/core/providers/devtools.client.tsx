"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";

import { getQueryClient } from "@/core/providers/query/client";

// E2E runs must not mount devtools: their overlays intercept pointer events.
const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

export const Devtools = () => {
  const queryClient = getQueryClient();

  if (isE2E) {
    return null;
  }

  return (
    <>
      <TanStackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel client={queryClient} />,
          },
          {
            name: "TanStack Form",
            render: <FormDevtoolsPanel />,
          },
        ]}
      />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
};
