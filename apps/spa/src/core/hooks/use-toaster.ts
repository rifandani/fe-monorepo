/* oxlint-disable eslint/func-style -- function declarations */
import { use } from "react";

import { ToastContext } from "@/core/providers/toast/context";

export function useToaster() {
  const context = use(ToastContext);
  if (!context) {
    throw new Error("useToaster: cannot find the ToastContext");
  }
  return context;
}
