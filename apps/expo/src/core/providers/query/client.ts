import { QueryClient } from "@tanstack/react-query";
import { secondsToMilliseconds } from "date-fns";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // gcTime: minutesToMilliseconds(5), // Defaults to 5 mins
      staleTime: secondsToMilliseconds(30), // Defaults to 0
      networkMode: "offlineFirst",
    },
  },
});
