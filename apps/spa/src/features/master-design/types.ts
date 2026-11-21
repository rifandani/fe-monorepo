import type { ComponentType } from "react";

export interface ComponentEntry {
  id: string;
  name: string;
  Showcase: ComponentType;
}

export interface Category {
  id: string;
  name: string;
  entries: ComponentEntry[];
}
