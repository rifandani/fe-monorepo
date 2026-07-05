/* oxlint-disable eslint/func-style -- function declarations */
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./client";

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
