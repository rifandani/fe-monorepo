import type { FailurePresenter } from "@workspace/core/http/failure";
import { toast } from "sonner";

import { appRuntime } from "@/lib/layers/runtime";
import { useTranslation } from "@/providers/i18n/context";
import { TRACER_MUTATION_ON_ERROR } from "@/shared/constants/global";
import { recordException, toReportedError } from "@/utils/telemetry";

export const useFailurePresenter = (): FailurePresenter => {
  const { t } = useTranslation();

  return {
    translate: t,
    showError: (message) => {
      toast.error(message);
    },
    reportDefect: (cause) => {
      // oxlint-disable-next-line landmines/no-unowned-task -- appRuntime owns the fiber and interrupts it on dispose; recordException cannot fail
      appRuntime.runFork(
        recordException(TRACER_MUTATION_ON_ERROR, toReportedError(cause))
      );
    },
  };
};
