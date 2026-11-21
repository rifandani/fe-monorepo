import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy } from "react";

import { isFeatureEnabled } from "@/lib/feature-flags/is-enabled";

const MasterDesignPage = lazy(async () => {
  const m = await import("@/features/master-design/catalog-page");

  return { default: m.MasterDesignPage };
});

export const Route = createFileRoute("/master-design")({
  beforeLoad: () => {
    if (!isFeatureEnabled("componentCatalog")) {
      throw notFound();
    }
  },
  component: MasterDesignPage,
});
