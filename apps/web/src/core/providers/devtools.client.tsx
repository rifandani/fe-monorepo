"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";

import { getQueryClient } from "@/core/providers/query/client";

export function Devtools() {
  const queryClient = getQueryClient();
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
          // {
          //   name: 'TanStack Form',
          //   render: <FormDevtoolsPanel />,
          // },
        ]}
      />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}
