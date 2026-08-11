import { createFileRoute, notFound } from "@tanstack/react-router";

import { useSeo } from "@/core/hooks/use-seo";
import { MasterDesignCatalog } from "@/master-design/catalog";

/** Catalog-only: drop Chart's `flex justify-center` so demos stretch full width. */
const MasterDesignPage = () => {
  useSeo({
    description: "Internal catalog of core UI components and their variants.",
    title: "Component Catalog",
  });

  return (
    <div className="contents **:data-chart:block **:data-chart:justify-normal">
      <MasterDesignCatalog />
    </div>
  );
};

export const Route = createFileRoute("/master-design")({
  beforeLoad: () => {
    // Dev-only catalog: hidden from production builds (`build:prod`).
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: MasterDesignPage,
});
