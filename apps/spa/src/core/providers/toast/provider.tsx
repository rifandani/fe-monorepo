import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

import { ToastContext, useCreateToastContext } from "./context";

export const AppToastProvider = ({ children }: PropsWithChildren) => {
  const value = useCreateToastContext();
  return (
    <ToastContext value={value}>
      {children}
      <Toaster {...value[0]} />
    </ToastContext>
  );
};
