import { AreaChartShowcase } from "./showcases/area-chart";
import { BadgeShowcase } from "./showcases/badge";
import { ButtonShowcase } from "./showcases/button";
import { CardShowcase } from "./showcases/card";
import { DialogShowcase } from "./showcases/dialog";
import { SelectShowcase } from "./showcases/select";
import { TableShowcase } from "./showcases/table";
import { TextFieldShowcase } from "./showcases/text-field";
import type { Category } from "./types";

/**
 * Source of truth for the Component Catalog: drives the nav, the section
 * anchors, and the page order. Add a Component Entry here to surface it.
 */
export const categories: Category[] = [
  {
    id: "layout",
    name: "Layout",
    entries: [{ id: "card", name: "Card", Showcase: CardShowcase }],
  },
  {
    id: "buttons-actions",
    name: "Buttons & Actions",
    entries: [{ id: "button", name: "Button", Showcase: ButtonShowcase }],
  },
  {
    id: "forms-inputs",
    name: "Forms & Inputs",
    entries: [
      { id: "text-field", name: "Text Field", Showcase: TextFieldShowcase },
      { id: "select", name: "Select", Showcase: SelectShowcase },
    ],
  },
  {
    id: "overlays",
    name: "Overlays",
    entries: [{ id: "dialog", name: "Dialog", Showcase: DialogShowcase }],
  },
  {
    id: "data-display",
    name: "Data Display",
    entries: [
      { id: "table", name: "Table", Showcase: TableShowcase },
      { id: "badge", name: "Badge", Showcase: BadgeShowcase },
    ],
  },
  {
    id: "charts",
    name: "Charts",
    entries: [
      { id: "area-chart", name: "Area Chart", Showcase: AreaChartShowcase },
    ],
  },
];

/** Flat list of every entry id, in page order (used to seed the scroll spy). */
export const entryIds: string[] = categories.flatMap((category) =>
  category.entries.map((entry) => entry.id)
);
