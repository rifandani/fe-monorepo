import { useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from "@/core/components/ui";

import { categories } from "./registry";
import type { Category } from "./types";

interface CatalogNavProps {
  activeId: string | null;
  filter: string;
  onNavigate: (id: string) => void;
}

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

  const visible: Category[] = [];
  for (const category of categories) {
    const entries = query
      ? category.entries.filter((entry) =>
          entry.name.toLowerCase().includes(query)
        )
      : category.entries;
    if (entries.length > 0) {
      visible.push({ ...category, entries });
    }
  }

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(categories.map((category) => category.id))
  );

  // While filtering, force every matching group open regardless of user state.
  const expandedKeys = query
    ? new Set(visible.map((category) => category.id))
    : expanded;

  return (
    <nav aria-label="Components" className="p-3">
      {visible.length === 0 ? (
        <p className="px-3 py-2 text-muted-fg text-sm">No matches.</p>
      ) : (
        <DisclosureGroup
          allowsMultipleExpanded
          expandedKeys={expandedKeys}
          onExpandedChange={(keys) =>
            setExpanded(new Set([...keys].map(String)))
          }
        >
          {visible.map((category) => (
            <Disclosure id={category.id} key={category.id}>
              <DisclosureTrigger>{category.name}</DisclosureTrigger>
              <DisclosurePanel>
                <ul className="flex flex-col gap-0.5">
                  {category.entries.map((entry) => {
                    const isActive = entry.id === activeId;
                    return (
                      <li key={entry.id}>
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
                  })}
                </ul>
              </DisclosurePanel>
            </Disclosure>
          ))}
        </DisclosureGroup>
      )}
    </nav>
  );
};
