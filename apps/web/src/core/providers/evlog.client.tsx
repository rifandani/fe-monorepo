/* oxlint-disable eslint/func-style -- function declarations */
import { clearIdentity, EvlogProvider, setIdentity } from "evlog/next/client";
import { useEffect } from "react";

import { authClient } from "@/auth/utils/auth.client";
import { SERVICE_NAME } from "@/core/constants/global";

export function AppEvlogProvider({ children }: { children: React.ReactNode }) {
  const { data } = authClient.useSession();
  useEffect(() => {
    if (data?.user) {
      setIdentity({ userId: data.user.id, userName: data.user.name });
    } else {
      clearIdentity();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user?.id]);
  return (
    // Send to our server first, then to OTLP collector to keep credentials secure (not bundled with client) and events captured reliably
    <EvlogProvider
      service={SERVICE_NAME}
      transport={{ enabled: true, endpoint: "/api/evlog/ingest" }}
    >
      {children}
    </EvlogProvider>
  );
}
