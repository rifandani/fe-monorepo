import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { queryClient } from "@/core/providers/query/client";

export const AppQueryProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
