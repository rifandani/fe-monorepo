import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { useTranslation } from "@/providers/i18n/context";
import { isOffline, resolveSwPrompt } from "@/utils/sw";

/** How often to poll the server for a new service worker. */
const UPDATE_CHECK_PERIOD_MS = 60 * 60 * 1000;

/** Fetch the service worker script, and update the registration when it changed. */
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

const registerPeriodicSync = (swUrl: string, r: ServiceWorkerRegistration) => {
  console.log("✅ SW activated", r);

  if (UPDATE_CHECK_PERIOD_MS <= 0) {
    return;
  }

  setInterval(() => {
    void checkForSwUpdate(swUrl, r);
  }, UPDATE_CHECK_PERIOD_MS);
};

/** Run `run` once this worker reaches the `activated` state. */
const whenActivated = (sw: ServiceWorker | null, run: () => void) => {
  sw?.addEventListener("statechange", () => {
    if (sw.state === "activated") {
      run();
    }
  });
};

/**
 * Run `run` as soon as the registration has an active worker — immediately if
 * it already does, otherwise when the installing one activates.
 */
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

const onRegisteredSW = (
  swUrl: string,
  r: ServiceWorkerRegistration | undefined
) => {
  onSwActivated(r, (registration) => {
    registerPeriodicSync(swUrl, registration);
  });
};

const onRegisterError = (cause: unknown) => {
  console.error("🛑 Service Worker registration error", cause);
};

export const ReloadPromptSw = () => {
  const { t } = useTranslation();

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // immediate: true,
    onRegisteredSW,
    onRegisterError,
  });

  // listens to reload prompt SW
  useEffect(() => {
    const prompt = resolveSwPrompt({ needRefresh, offlineReady });

    if (!prompt) {
      return;
    }

    toast(t(prompt.messageKey), {
      closeButton: true,
      duration: 60 * 1000, // 1 minute
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineReady, needRefresh]);

  return <aside id="ReloadPromptSW" className="hidden" />;
};
