export const isOffline = () => "onLine" in navigator && !navigator.onLine;

export interface SwPrompt {
  messageKey: "appReady" | "newContentAvailable";
  canReload: boolean;
}

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
