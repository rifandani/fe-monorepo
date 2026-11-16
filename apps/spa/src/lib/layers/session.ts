import { Session } from "@workspace/core/session/session";
import { Effect } from "effect";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

/**
 * @description The Session of this app, on its Persistence.
 *
 * End Session also clears the cached queries, so the next Session never reads
 * the previous one's data. It deliberately does not navigate: the Session gate
 * (`app/providers/router/session-gate.ts`) reloads the router when `sessionAtom`
 * changes, so the route guards run again and discarding the Session is the
 * navigation.
 */
export const SessionLive = Session.layer(persistence, {
  onEnd: Effect.sync(() => {
    queryClient.clear();
  }),
});
