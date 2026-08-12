import type { ComponentType } from "react";

/** One component's place in the Component Catalog. */
export interface ComponentEntry {
  /** Slug used for the section anchor id and the URL hash. */
  id: string;
  name: string;
  Showcase: ComponentType;
}

/** A named grouping of Component Entries that drives nav grouping and page order. */
export interface Category {
  id: string;
  name: string;
  entries: ComponentEntry[];
}
