import { useSeo } from "@/core/hooks/use-seo";

import { MasterDesignCatalog } from "./catalog";

/** Catalog-only: drop Chart's `flex justify-center` so demos stretch full width. */
export const MasterDesignPage = () => {
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
