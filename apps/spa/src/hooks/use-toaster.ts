// fallow-ignore-file unused-file
import { use } from "react";

import { ToastContext } from "@/providers/toast/context";

export const useToaster = () => {
  const context = use(ToastContext);

  if (context === null) {
    throw new Error("useToaster: cannot find the ToastContext");
  }

  return context;
};
