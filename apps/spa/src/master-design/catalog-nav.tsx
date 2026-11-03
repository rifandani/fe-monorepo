import { cn } from "cn";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";

import { categories } from "./registry";
import type { Category, ComponentEntry } from "./types";

interface CatalogNavProps {
  activeId: string | null;
  filter: string;
  onNavigate: (_sectionId: string) => void;
}

/**
 * Space kept clear above and below the active link when the nav follows the
 * page. It is larger than the sticky category label, so the label never hides
 * the active link.
 */
const FOLLOW_MARGIN_PX = 56;

const visibleCategories = (needle: string): Category[] =>
  categories.flatMap((category) => {
    const entries = needle
      ? category.entries.filter((entry) =>
          entry.name.toLowerCase().includes(needle)
        )
      : category.entries;

    return entries.length === 0 ? [] : [{ ...category, entries }];
  });

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Let modified clicks (new tab, new window) keep their native behavior. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/**
 * Scroll the nav so that the active link stays in view. Only the nav scrolls;
 * the page position does not change.
 */
const followActiveLink = (scroller: HTMLElement, activeId: string) => {
  const link = scroller.querySelector<HTMLElement>(`a[href="#${activeId}"]`);

  if (!link) {
    return;
  }

  const box = scroller.getBoundingClientRect();
  const { top, bottom } = link.getBoundingClientRect();

  const isInView =
    top >= box.top + FOLLOW_MARGIN_PX &&
    bottom <= box.bottom - FOLLOW_MARGIN_PX;

  if (isInView) {
    return;
  }

  scroller.scrollTo({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    top: scroller.scrollTop + (top - box.top) - box.height / 3,
  });
};

const CatalogNavLink = ({
  entry,
  isActive,
  onNavigate,
}: {
  entry: ComponentEntry;
  isActive: boolean;
  onNavigate: (_sectionId: string) => void;
}) => (
  <li>
    <a
      aria-current={isActive ? "location" : undefined}
      className={cn(
        "-ml-px block truncate rounded-r-md border-l border-transparent py-1.5 pr-3 pl-4 text-sm transition-colors duration-150",
        "text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
        "focus-visible:inset-ring-ring/70 outline-hidden focus-visible:inset-ring-2 forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-[Highlight]",
        isActive &&
          "border-primary bg-primary-subtle text-primary-subtle-foreground hover:border-primary hover:text-primary-subtle-foreground font-medium"
      )}
      href={`#${entry.id}`}
      onClick={(event) => {
        if (!isPlainClick(event)) {
          return;
        }

        event.preventDefault();
        onNavigate(entry.id);
      }}
    >
      {entry.name}
    </a>
  </li>
);

const CatalogNavGroup = ({
  activeId,
  category,
  onNavigate,
}: {
  activeId: string | null;
  category: Category;
  onNavigate: (_sectionId: string) => void;
}) => {
  const labelId = `catalog-nav-${category.id}`;
  const isCurrent = category.entries.some((entry) => entry.id === activeId);

  return (
    <div>
      <div
        className={cn(
          "bg-sidebar sticky top-0 z-10 flex items-baseline justify-between gap-2 px-3 pt-5 pb-2 text-xs font-semibold tracking-wide uppercase transition-colors duration-150",
          isCurrent ? "text-foreground" : "text-muted-foreground"
        )}
        id={labelId}
      >
        <span className="truncate">{category.name}</span>
        <span
          aria-hidden
          className="text-muted-foreground font-mono font-medium tabular-nums"
        >
          {category.entries.length}
        </span>
      </div>
      <ul aria-labelledby={labelId} className="border-border ml-3 border-l">
        {category.entries.map((entry) => (
          <CatalogNavLink
            entry={entry}
            isActive={entry.id === activeId}
            key={entry.id}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
};

/**
 * Left navigation for the Component Catalog. It is a scrollspy: every category
 * is always open, and the link for the section in view is marked as the
 * current location. When the page scrolls, the nav scrolls too, so the
 * current link stays visible.
 */
export const CatalogNav = ({
  activeId,
  filter,
  onNavigate,
}: CatalogNavProps) => {
  const scrollerRef = useRef<HTMLElement>(null);
  const query = filter.trim().toLowerCase();
  const visible = visibleCategories(query);

  useEffect(() => {
    if (scrollerRef.current && activeId !== null && activeId !== "") {
      followActiveLink(scrollerRef.current, activeId);
    }
  }, [activeId]);

  return (
    <nav
      aria-label="Components"
      className="h-full overflow-y-auto overscroll-contain px-3 pb-6"
      ref={scrollerRef}
    >
      {visible.length === 0 ? (
        <p className="text-muted-foreground px-3 pt-5 text-sm">
          No components match “{filter.trim()}”.
        </p>
      ) : (
        visible.map((category) => (
          <CatalogNavGroup
            activeId={activeId}
            category={category}
            key={category.id}
            onNavigate={onNavigate}
          />
        ))
      )}
    </nav>
  );
};
