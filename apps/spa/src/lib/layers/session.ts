import { Session } from "@workspace/core/session/session";
import { makeWebSessionLock } from "@workspace/core/session/session-lock";
import { Effect } from "effect";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

export const SessionLive = Session.layer(persistence, {
  lock: makeWebSessionLock("app-session-refresh"),
  onEnd: Effect.sync(() => {
    queryClient.clear();
  }),
});
