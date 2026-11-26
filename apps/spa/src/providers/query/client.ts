import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      networkMode: "offlineFirst",
      retry: 3,
    },
    mutations: {
      networkMode: "always",
      retry: false,
    },
  },
});
