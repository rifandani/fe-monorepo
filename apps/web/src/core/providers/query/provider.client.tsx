"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { getQueryClient } from "./client";

export const AppQueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
