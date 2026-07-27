import { useState } from "react";

import type { BaseSheetState } from "@/core/components/sheet/types";

export const useBaseSheet = () => {
  const [state, setState] = useState<BaseSheetState>({
    open: false,
    position: 0,
  });

  const open = () => {
    setState((prev) => ({ ...prev, open: true }));
  };

  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return { state, setState, open, close };
};
