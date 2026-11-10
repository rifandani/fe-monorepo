/* oxlint-disable import/no-cycle */
// fallow-ignore-file circular-dependency
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { FeatureFlagsPanel } from "@/app/devtools/feature-flags-panel";
import { router } from "@/app/providers/router/client";
import { queryClient } from "@/providers/query/client";

export const Devtools = () => (
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
);
