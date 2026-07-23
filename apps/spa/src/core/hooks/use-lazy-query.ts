/* oxlint-disable react-doctor/query-destructure-result */
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useLazyQuery = <TData, TError>(
  options: Omit<UseQueryOptions<TData, TError>, "enabled">
) => {
  const [enabled, setEnabled] = useState(false);
  const query = useQuery<TData, TError>({
    ...options,
    enabled,
  });
  const trigger = () => {
    if (!enabled) {
      setEnabled(true);
    }
  };
  return [trigger, query] as const;
};
