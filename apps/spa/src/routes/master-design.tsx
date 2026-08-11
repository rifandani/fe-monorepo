import { createFileRoute, notFound } from "@tanstack/react-router";

import { MasterDesignCatalog } from "@/master-design/catalog";

export const Route = createFileRoute("/master-design")({
  beforeLoad: () => {
    // Dev-only catalog: hidden from production builds (`build:prod`).
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: MasterDesignCatalog,
});
