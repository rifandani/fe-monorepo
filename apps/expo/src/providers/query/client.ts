import { QueryClient } from "@tanstack/react-query";
import { secondsToMilliseconds } from "date-fns";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: secondsToMilliseconds(30),
      networkMode: "offlineFirst",
    },
  },
});
