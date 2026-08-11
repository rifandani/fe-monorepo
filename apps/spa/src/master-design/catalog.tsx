import { useEffect, useState } from "react";

import { ThemeToggle } from "@/core/components/theme-toggle";
import { SearchField, SearchInput } from "@/core/components/ui";
import { useSeo } from "@/core/hooks/use-seo";

import { CatalogNav } from "./catalog-nav";
import { categories, entryIds } from "./registry";
import { useScrollSpy } from "./use-scroll-spy";

export const MasterDesignCatalog = () => {
  useSeo({
    description: "Internal catalog of core UI components and their variants.",
    title: "Component Catalog",
  });

  const [filter, setFilter] = useState("");
  const { activeId, scrollTo } = useScrollSpy(entryIds);

  // Honor deep links like /master-design#combo-box once sections have painted.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && entryIds.includes(hash)) {
      requestAnimationFrame(() => scrollTo(hash));
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-svh w-full bg-bg text-fg">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 overflow-y-auto border-r bg-sidebar md:block">
        <CatalogNav activeId={activeId} filter={filter} onNavigate={scrollTo} />
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-bg/80 px-6 py-3 backdrop-blur">
          <div>
            <h1 className="font-semibold text-lg">Component Catalog</h1>
            <p className="text-muted-fg text-xs">
              {entryIds.length} components · dev only
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <SearchField
              aria-label="Filter components"
              className="w-56"
              onChange={setFilter}
              value={filter}
            >
              <SearchInput placeholder="Filter components…" />
            </SearchField>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-10">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-6 border-b pb-2 font-semibold text-muted-fg text-sm uppercase tracking-wide">
                {category.name}
              </h2>
              <div className="flex flex-col gap-12">
                {category.entries.map((entry) => (
                  <section
                    className="scroll-mt-24"
                    data-md-section
                    id={entry.id}
                    key={entry.id}
                  >
                    <h3 className="mb-4 font-semibold text-xl">{entry.name}</h3>
                    <entry.Showcase />
                  </section>
                ))}
              </div>
            </section>
          ))}
          <div aria-hidden className="h-[50vh]" />
        </div>
      </main>
    </div>
  );
};
