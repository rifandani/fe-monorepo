/* oxlint-disable eslint/func-style -- function declarations */
import * as React from "react";

import { ToastContext } from "@/core/providers/toast/context";

export function useToaster() {
  const context = React.use(ToastContext);
  if (!context) {
    throw new Error("useToaster: cannot find the ToastContext");
  }
  return context;
}
