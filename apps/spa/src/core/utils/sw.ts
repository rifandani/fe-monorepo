/**
 * Whether the browser reports itself as offline. `onLine` is optional in the
 * Navigator spec, so an absent flag is treated as "assume we can reach the
 * network" rather than as offline.
 */
export const isOffline = () => "onLine" in navigator && !navigator.onLine;

export interface SwPrompt {
  /** i18n key of the message to show. */
  messageKey: "appReady" | "newContentAvailable";
  /** Whether to offer the reload action alongside the message. */
  canReload: boolean;
}

/**
 * Map the two flags `useRegisterSW` exposes onto the single toast we show, or
 * `null` when there is nothing to tell the user.
 *
 * `offlineReady` wins the message slot because it is the one-off "install
 * finished" notice, while `needRefresh` is what makes the reload action
 * actionable — both can be true on the very first update after an install.
 */
export const resolveSwPrompt = ({
  needRefresh,
  offlineReady,
}: {
  needRefresh: boolean;
  offlineReady: boolean;
}): SwPrompt | null => {
  if (!(needRefresh || offlineReady)) {
    return null;
  }
  return {
    canReload: needRefresh,
    messageKey: offlineReady ? "appReady" : "newContentAvailable",
  };
};
