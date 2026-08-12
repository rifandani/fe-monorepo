import { useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from "@/core/components/ui/disclosure-group";

import { categories } from "./registry";
import type { Category, ComponentEntry } from "./types";

interface CatalogNavProps {
  activeId: string | null;
  filter: string;
  onNavigate: (id: string) => void;
}

const categoryIds = (cats: Category[]) =>
  new Set(cats.map((category) => category.id));

const visibleCategories = (needle: string): Category[] =>
  categories.flatMap((category) => {
    const entries = needle
      ? category.entries.filter((entry) =>
          entry.name.toLowerCase().includes(needle)
        )
      : category.entries;
    return entries.length === 0 ? [] : [{ ...category, entries }];
  });

const CatalogNavItem = ({
  entry,
  isActive,
  onNavigate,
}: {
  entry: ComponentEntry;
  isActive: boolean;
  onNavigate: (id: string) => void;
}) => (
  <li>
    <button
      className={twMerge(
        "w-full rounded-md px-3 py-1.5 text-left text-muted-fg text-sm transition-colors hover:bg-secondary hover:text-fg",
        isActive &&
          "bg-primary font-medium text-primary-fg hover:bg-primary hover:text-primary-fg"
      )}
      data-active={isActive || undefined}
      onClick={() => onNavigate(entry.id)}
      type="button"
    >
      {entry.name}
    </button>
  </li>
);

/**
 * Left navigation for the Component Catalog: collapsible category groups whose
 * items highlight as the reader scrolls. Built on the Disclosure primitives
 * that the Sidebar itself uses, so it stays visually consistent with the app.
 */
export const CatalogNav = ({
  activeId,
  filter,
  onNavigate,
}: CatalogNavProps) => {
  const query = filter.trim().toLowerCase();
  const visible = visibleCategories(query);
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    categoryIds(categories)
  );

  // While filtering, force every matching group open regardless of user state.
  const expandedKeys = query ? categoryIds(visible) : expanded;

  if (visible.length === 0) {
    return (
      <nav aria-label="Components" className="p-3">
        <p className="px-3 py-2 text-muted-fg text-sm">No matches.</p>
      </nav>
    );
  }

  return (
    <nav aria-label="Components" className="p-3">
      <DisclosureGroup
        allowsMultipleExpanded
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => setExpanded(new Set([...keys].map(String)))}
      >
        {visible.map((category) => (
          <Disclosure id={category.id} key={category.id}>
            <DisclosureTrigger>{category.name}</DisclosureTrigger>
            <DisclosurePanel>
              <ul className="flex flex-col gap-0.5">
                {category.entries.map((entry) => (
                  <CatalogNavItem
                    entry={entry}
                    isActive={entry.id === activeId}
                    key={entry.id}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </DisclosurePanel>
          </Disclosure>
        ))}
      </DisclosureGroup>
    </nav>
  );
};
