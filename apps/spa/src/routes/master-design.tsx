import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy } from "react";

import { isFeatureEnabled } from "@/core/feature-flags/is-enabled";

// Keep this route module free of catalog/UI imports so routeTree's static
// import cannot pull Intent UI into the main chunk (PWA 2 MiB precache limit).
const MasterDesignPage = lazy(async () => {
  const m = await import("@/master-design/catalog-page");
  return { default: m.MasterDesignPage };
});

export const Route = createFileRoute("/master-design")({
  beforeLoad: () => {
    // Gated by the `componentCatalog` Feature Flag (ON by default in DEV only).
    if (!isFeatureEnabled("componentCatalog")) {
      throw notFound();
    }
  },
  component: MasterDesignPage,
});
