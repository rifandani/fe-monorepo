import { QueryClient } from "@tanstack/react-query";

export const makeTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
