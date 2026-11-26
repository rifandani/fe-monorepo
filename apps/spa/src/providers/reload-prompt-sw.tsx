import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { useTranslation } from "@/providers/i18n/context";
import { isOffline, resolveSwPrompt } from "@/utils/sw";

const UPDATE_CHECK_PERIOD_MS = 60 * 60 * 1000;

const checkForSwUpdate = async (
  swUrl: string,
  r: ServiceWorkerRegistration
) => {
  if (isOffline()) {
    return;
  }

  try {
    console.log("🔵 Checking for SW updates...");

    // fallow-ignore-next-line security-sink -- swUrl comes from vite-plugin-pwa's onRegisteredSW; SW scripts are same-origin by spec
    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp.status === 200) {
      console.log("🔵 Updating SW...");
      await r.update();
    }
  } catch (error) {
    console.warn("SW update check failed:", error);
  }
};

interface PeriodicSyncOwner {
  mounted: boolean;
  stop: (() => void) | null;
}

const startPeriodicSync = (
  swUrl: string,
  r: ServiceWorkerRegistration
): (() => void) => {
  console.log("✅ SW activated", r);

  const intervalId = setInterval(() => {
    void checkForSwUpdate(swUrl, r);
  }, UPDATE_CHECK_PERIOD_MS);

  return () => {
    clearInterval(intervalId);
  };
};

const whenActivated = (sw: ServiceWorker | null, run: () => void) => {
  sw?.addEventListener("statechange", () => {
    if (sw.state === "activated") {
      run();
    }
  });
};

const onSwActivated = (
  r: ServiceWorkerRegistration | undefined,
  run: (registration: ServiceWorkerRegistration) => void
) => {
  if (!r) {
    return;
  }

  if (r.active?.state === "activated") {
    run(r);

    return;
  }

  whenActivated(r.installing, () => {
    run(r);
  });
};

const onRegisterError = (cause: unknown) => {
  console.error("🛑 Service Worker registration error", cause);
};

export const ReloadPromptSw = () => {
  const { t } = useTranslation();

  const periodicSync = useRef<PeriodicSyncOwner>({
    mounted: true,
    stop: null,
  });

  const onRegisteredSW = (
    swUrl: string,
    r: ServiceWorkerRegistration | undefined
  ) => {
    onSwActivated(r, (registration) => {
      const owner = periodicSync.current;

      owner.stop?.();
      owner.stop = owner.mounted
        ? startPeriodicSync(swUrl, registration)
        : null;
    });
  };

  useEffect(() => {
    const owner = periodicSync.current;

    owner.mounted = true;

    return () => {
      owner.mounted = false;
      owner.stop?.();
      owner.stop = null;
    };
  }, []);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW,
    onRegisterError,
  });

  useEffect(() => {
    const prompt = resolveSwPrompt({ needRefresh, offlineReady });

    if (!prompt) {
      return;
    }

    toast(t(prompt.messageKey), {
      closeButton: true,
      duration: 60 * 1000,
      onDismiss: () => {
        setOfflineReady(false);
        setNeedRefresh(false);
      },
      ...(prompt.canReload && {
        action: {
          label: t("reload"),
          onClick: () => {
            void updateServiceWorker(true);
          },
        },
      }),
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the toast shows only when the service worker state changes
  }, [offlineReady, needRefresh]);

  return <aside id="ReloadPromptSW" className="hidden" />;
};
