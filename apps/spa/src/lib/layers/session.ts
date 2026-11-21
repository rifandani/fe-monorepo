import { Session } from "@workspace/core/session/session";
import { Effect } from "effect";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

export const SessionLive = Session.layer(persistence, {
  onEnd: Effect.sync(() => {
    queryClient.clear();
  }),
});
