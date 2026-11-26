import { QueryClient } from "@tanstack/react-query";

export const makeTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { networkMode: "always", retry: false },
    },
  });
