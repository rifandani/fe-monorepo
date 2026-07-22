"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Agentation } from "agentation";

import { getQueryClient } from "@/core/providers/query/client";

export const Devtools = () => {
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
