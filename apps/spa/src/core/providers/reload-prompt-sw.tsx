/* oxlint-disable eslint/func-style -- function declarations */
import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

import { useTranslation } from "@/core/providers/i18n/context";

function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration
) {
  console.log("✅ SW activated", r);
  if (period <= 0) {
    return;
  }
  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) {
      return;
    }
    try {
      console.log("🔵 Checking for SW updates...");
      const resp = await fetch(swUrl, {
        cache: "no-store",
        headers: {
          cache: "no-store",
          "cache-control": "no-cache",
        },
      });
      if (resp?.status === 200) {
        console.log("🔵 Updating SW...");
        await r.update();
      }
    } catch (error) {
      console.warn("SW update check failed:", error);
    }
  }, period);
}
function onRegisterError(error: unknown) {
  console.error("🛑 Service Worker registration error", error);
}
export function ReloadPromptSw() {
  // check for updates every hour
  const period = 60 * 60 * 1000;
  const onRegisteredSW = (
    swUrl: string,
    r: ServiceWorkerRegistration | undefined
  ) => {
    if (period <= 0) {
      return;
    }
    if (r?.active?.state === "activated") {
      registerPeriodicSync(period, swUrl, r);
    } else if (r?.installing) {
      r.installing.addEventListener("statechange", (e) => {
        const sw = e.target as ServiceWorker;
        if (sw.state === "activated") {
          registerPeriodicSync(period, swUrl, r);
        }
      });
    }
  };
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
    if (offlineReady || needRefresh) {
      toast(offlineReady ? t("appReady") : t("newContentAvailable"), {
        closeButton: true,
        duration: 60 * 1000, // 1 minute
        onDismiss: () => {
          setOfflineReady(false);
          setNeedRefresh(false);
        },
        ...(needRefresh && {
          action: {
            label: t("reload"),
            onClick: () => updateServiceWorker(true),
          },
        }),
      });
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineReady, needRefresh]);
  return <aside id="ReloadPromptSW" className="hidden" />;
}
