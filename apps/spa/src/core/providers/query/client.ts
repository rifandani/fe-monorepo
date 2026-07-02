import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      // Defaults to 5 mins
      // gcTime: 1_000 * 60 * 5,
      staleTime: 1000 * 30,
    },
  },
});
