/* oxlint-disable import/no-cycle */
// fallow-ignore-file circular-dependency
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Agentation } from "agentation";

import { FeatureFlagsPanel } from "@/core/feature-flags/panel";
import { queryClient } from "@/core/providers/query/client";
import { router } from "@/core/providers/router/client";

export const Devtools = () => (
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
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel router={router} />,
        },
        {
          name: "TanStack Form",
          render: <FormDevtoolsPanel />,
        },
        {
          name: "Feature Flags",
          render: <FeatureFlagsPanel />,
        },
      ]}
    />
    <Agentation />
  </>
);
