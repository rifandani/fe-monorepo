import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy } from "react";

// Keep this route module free of catalog/UI imports so routeTree's static
// import cannot pull Intent UI into the main chunk (PWA 2 MiB precache limit).
const MasterDesignPage = lazy(async () => {
  const m = await import("@/master-design/catalog-page");
  return { default: m.MasterDesignPage };
});

export const Route = createFileRoute("/master-design")({
  beforeLoad: () => {
    // Dev-only catalog: hidden from production builds (`build:prod`).
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: MasterDesignPage,
});
