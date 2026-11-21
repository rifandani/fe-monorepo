import { useSeo } from "@/hooks/use-seo";

import { MasterDesignCatalog } from "./catalog";

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
