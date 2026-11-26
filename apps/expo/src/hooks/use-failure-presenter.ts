import { useToastController } from "@tamagui/toast";
import type { FailurePresenter } from "@workspace/core/http/failure";

import { useTranslation } from "@/providers/i18n/context";
import { logger } from "@/utils/logger";
import type { ToastCustomData } from "@/utils/toast";

export const useFailurePresenter = (): FailurePresenter => {
  const toast = useToastController();
  const { t } = useTranslation();

  return {
    translate: t,
    showError: (message) => {
      toast.show(message, {
        customData: { preset: "error" } satisfies ToastCustomData,
      });
    },
    reportDefect: (cause) => {
      logger.error("mutation.onError", cause);
    },
  };
};
