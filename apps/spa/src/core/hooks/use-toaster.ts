import { use } from "react";

import { ToastContext } from "@/core/providers/toast/context";

export const useToaster = () => {
  const context = use(ToastContext);
  if (!context) {
    throw new Error("useToaster: cannot find the ToastContext");
  }
  return context;
};
