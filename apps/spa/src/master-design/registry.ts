import { AreaChartShowcase } from "./showcases/area-chart";
import { AvatarShowcase } from "./showcases/avatar";
import { BadgeShowcase } from "./showcases/badge";
import { BarChartShowcase } from "./showcases/bar-chart";
import { BarListShowcase } from "./showcases/bar-list";
import { BreadcrumbsShowcase } from "./showcases/breadcrumbs";
import { ButtonShowcase } from "./showcases/button";
import { ButtonGroupShowcase } from "./showcases/button-group";
import { CalendarShowcase } from "./showcases/calendar";
import { CardShowcase } from "./showcases/card";
import { CarouselShowcase } from "./showcases/carousel";
import { CheckboxShowcase } from "./showcases/checkbox";
import { ChoiceBoxShowcase } from "./showcases/choice-box";
import { ColorAreaShowcase } from "./showcases/color-area";
import { ColorFieldShowcase } from "./showcases/color-field";
import { ColorPickerShowcase } from "./showcases/color-picker";
import { ColorSliderShowcase } from "./showcases/color-slider";
import { ColorSwatchShowcase } from "./showcases/color-swatch";
import { ColorSwatchPickerShowcase } from "./showcases/color-swatch-picker";
import { ColorThumbShowcase } from "./showcases/color-thumb";
import { ColorWheelShowcase } from "./showcases/color-wheel";
import { ComboBoxShowcase } from "./showcases/combo-box";
import { CommandMenuShowcase } from "./showcases/command-menu";
import { ContainerShowcase } from "./showcases/container";
import { ContextMenuShowcase } from "./showcases/context-menu";
import { DateFieldShowcase } from "./showcases/date-field";
import { DatePickerShowcase } from "./showcases/date-picker";
import { DateRangePickerShowcase } from "./showcases/date-range-picker";
import { DescriptionListShowcase } from "./showcases/description-list";
import { DialogShowcase } from "./showcases/dialog";
import { DisclosureGroupShowcase } from "./showcases/disclosure-group";
import { DrawerShowcase } from "./showcases/drawer";
import { DropZoneShowcase } from "./showcases/drop-zone";
import { DropdownShowcase } from "./showcases/dropdown";
import { FieldShowcase } from "./showcases/field";
import { FileTriggerShowcase } from "./showcases/file-trigger";
import { GridListShowcase } from "./showcases/grid-list";
import { HeadingShowcase } from "./showcases/heading";
import { InputShowcase } from "./showcases/input";
import { InputOtpShowcase } from "./showcases/input-otp";
import { KeyboardShowcase } from "./showcases/keyboard";
import { LeaderboardShowcase } from "./showcases/leaderboard";
import { LineChartShowcase } from "./showcases/line-chart";
import { LinkShowcase } from "./showcases/link";
import { ListBoxShowcase } from "./showcases/list-box";
import { LoaderShowcase } from "./showcases/loader";
import { MenuShowcase } from "./showcases/menu";
import { MeterShowcase } from "./showcases/meter";
import { ModalShowcase } from "./showcases/modal";
import { MultipleSelectShowcase } from "./showcases/multiple-select";
import { NativeSelectShowcase } from "./showcases/native-select";
import { NavbarShowcase } from "./showcases/navbar";
import { NoteShowcase } from "./showcases/note";
import { NumberFieldShowcase } from "./showcases/number-field";
import { PaginationShowcase } from "./showcases/pagination";
import { PieChartShowcase } from "./showcases/pie-chart";
import { PopoverShowcase } from "./showcases/popover";
import { ProgressBarShowcase } from "./showcases/progress-bar";
import { ProgressCircleShowcase } from "./showcases/progress-circle";
import { RadioShowcase } from "./showcases/radio";
import { RangeCalendarShowcase } from "./showcases/range-calendar";
import { ScrollAreaShowcase } from "./showcases/scroll-area";
import { SearchFieldShowcase } from "./showcases/search-field";
import { SelectShowcase } from "./showcases/select";
import { SeparatorShowcase } from "./showcases/separator";
import { SheetShowcase } from "./showcases/sheet";
import { ShowMoreShowcase } from "./showcases/show-more";
import { SidebarShowcase } from "./showcases/sidebar";
import { SkeletonShowcase } from "./showcases/skeleton";
import { SliderShowcase } from "./showcases/slider";
import { SnippetShowcase } from "./showcases/snippet";
import { SwitchShowcase } from "./showcases/switch";
import { TableShowcase } from "./showcases/table";
import { TabsShowcase } from "./showcases/tabs";
import { TagFieldShowcase } from "./showcases/tag-field";
import { TagGroupShowcase } from "./showcases/tag-group";
import { TextShowcase } from "./showcases/text";
import { TextFieldShowcase } from "./showcases/text-field";
import { TextareaShowcase } from "./showcases/textarea";
import { TimeFieldShowcase } from "./showcases/time-field";
import { ToggleShowcase } from "./showcases/toggle";
import { ToggleGroupShowcase } from "./showcases/toggle-group";
import { ToolbarShowcase } from "./showcases/toolbar";
import { TooltipShowcase } from "./showcases/tooltip";
import { TrackerShowcase } from "./showcases/tracker";
import { TreeShowcase } from "./showcases/tree";
import { VisuallyHiddenShowcase } from "./showcases/visually-hidden";
import type { Category } from "./types";

/**
 * Source of truth for the Component Catalog: drives the nav, the section
 * anchors, and the page order. Add a Component Entry here to surface it.
 */
export const categories: Category[] = [
  {
    id: "layout",
    name: "Layout",
    entries: [
      { id: "container", name: "Container", Showcase: ContainerShowcase },
      { id: "card", name: "Card", Showcase: CardShowcase },
      { id: "separator", name: "Separator", Showcase: SeparatorShowcase },
      { id: "scroll-area", name: "Scroll Area", Showcase: ScrollAreaShowcase },
      { id: "sidebar", name: "Sidebar", Showcase: SidebarShowcase },
      { id: "navbar", name: "Navbar", Showcase: NavbarShowcase },
      { id: "heading", name: "Heading", Showcase: HeadingShowcase },
      { id: "text", name: "Text", Showcase: TextShowcase },
      {
        id: "visually-hidden",
        name: "Visually Hidden",
        Showcase: VisuallyHiddenShowcase,
      },
    ],
  },
  {
    id: "buttons-actions",
    name: "Buttons & Actions",
    entries: [
      { id: "button", name: "Button", Showcase: ButtonShowcase },
      {
        id: "button-group",
        name: "Button Group",
        Showcase: ButtonGroupShowcase,
      },
      { id: "toggle", name: "Toggle", Showcase: ToggleShowcase },
      {
        id: "toggle-group",
        name: "Toggle Group",
        Showcase: ToggleGroupShowcase,
      },
      { id: "link", name: "Link", Showcase: LinkShowcase },
      {
        id: "file-trigger",
        name: "File Trigger",
        Showcase: FileTriggerShowcase,
      },
      { id: "toolbar", name: "Toolbar", Showcase: ToolbarShowcase },
      { id: "show-more", name: "Show More", Showcase: ShowMoreShowcase },
    ],
  },
  {
    id: "forms-inputs",
    name: "Forms & Inputs",
    entries: [
      { id: "field", name: "Field", Showcase: FieldShowcase },
      { id: "input", name: "Input", Showcase: InputShowcase },
      { id: "text-field", name: "Text Field", Showcase: TextFieldShowcase },
      { id: "textarea", name: "Textarea", Showcase: TextareaShowcase },
      { id: "input-otp", name: "Input OTP", Showcase: InputOtpShowcase },
      {
        id: "search-field",
        name: "Search Field",
        Showcase: SearchFieldShowcase,
      },
      {
        id: "number-field",
        name: "Number Field",
        Showcase: NumberFieldShowcase,
      },
      {
        id: "native-select",
        name: "Native Select",
        Showcase: NativeSelectShowcase,
      },
      { id: "select", name: "Select", Showcase: SelectShowcase },
      { id: "combo-box", name: "Combo Box", Showcase: ComboBoxShowcase },
      {
        id: "multiple-select",
        name: "Multiple Select",
        Showcase: MultipleSelectShowcase,
      },
      { id: "checkbox", name: "Checkbox", Showcase: CheckboxShowcase },
      { id: "radio", name: "Radio", Showcase: RadioShowcase },
      { id: "switch", name: "Switch", Showcase: SwitchShowcase },
      { id: "slider", name: "Slider", Showcase: SliderShowcase },
      { id: "date-field", name: "Date Field", Showcase: DateFieldShowcase },
      { id: "date-picker", name: "Date Picker", Showcase: DatePickerShowcase },
      {
        id: "date-range-picker",
        name: "Date Range Picker",
        Showcase: DateRangePickerShowcase,
      },
      { id: "time-field", name: "Time Field", Showcase: TimeFieldShowcase },
      { id: "calendar", name: "Calendar", Showcase: CalendarShowcase },
      {
        id: "range-calendar",
        name: "Range Calendar",
        Showcase: RangeCalendarShowcase,
      },
      { id: "tag-field", name: "Tag Field", Showcase: TagFieldShowcase },
      { id: "tag-group", name: "Tag Group", Showcase: TagGroupShowcase },
      { id: "choice-box", name: "Choice Box", Showcase: ChoiceBoxShowcase },
      { id: "drop-zone", name: "Drop Zone", Showcase: DropZoneShowcase },
    ],
  },
  {
    id: "overlays",
    name: "Overlays",
    entries: [
      { id: "dialog", name: "Dialog", Showcase: DialogShowcase },
      { id: "modal", name: "Modal", Showcase: ModalShowcase },
      { id: "sheet", name: "Sheet", Showcase: SheetShowcase },
      { id: "drawer", name: "Drawer", Showcase: DrawerShowcase },
      { id: "popover", name: "Popover", Showcase: PopoverShowcase },
      { id: "tooltip", name: "Tooltip", Showcase: TooltipShowcase },
      { id: "menu", name: "Menu", Showcase: MenuShowcase },
      {
        id: "context-menu",
        name: "Context Menu",
        Showcase: ContextMenuShowcase,
      },
      {
        id: "command-menu",
        name: "Command Menu",
        Showcase: CommandMenuShowcase,
      },
      { id: "dropdown", name: "Dropdown", Showcase: DropdownShowcase },
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    entries: [
      { id: "breadcrumbs", name: "Breadcrumbs", Showcase: BreadcrumbsShowcase },
      { id: "pagination", name: "Pagination", Showcase: PaginationShowcase },
      { id: "tabs", name: "Tabs", Showcase: TabsShowcase },
      {
        id: "disclosure-group",
        name: "Disclosure Group",
        Showcase: DisclosureGroupShowcase,
      },
    ],
  },
  {
    id: "data-display",
    name: "Data Display",
    entries: [
      { id: "table", name: "Table", Showcase: TableShowcase },
      { id: "badge", name: "Badge", Showcase: BadgeShowcase },
      { id: "avatar", name: "Avatar", Showcase: AvatarShowcase },
      {
        id: "description-list",
        name: "Description List",
        Showcase: DescriptionListShowcase,
      },
      { id: "list-box", name: "List Box", Showcase: ListBoxShowcase },
      { id: "grid-list", name: "Grid List", Showcase: GridListShowcase },
      { id: "tree", name: "Tree", Showcase: TreeShowcase },
      { id: "leaderboard", name: "Leaderboard", Showcase: LeaderboardShowcase },
      { id: "bar-list", name: "Bar List", Showcase: BarListShowcase },
      { id: "tracker", name: "Tracker", Showcase: TrackerShowcase },
      { id: "carousel", name: "Carousel", Showcase: CarouselShowcase },
      { id: "snippet", name: "Snippet", Showcase: SnippetShowcase },
      { id: "keyboard", name: "Keyboard", Showcase: KeyboardShowcase },
    ],
  },
  {
    id: "feedback",
    name: "Feedback",
    entries: [
      { id: "note", name: "Note", Showcase: NoteShowcase },
      { id: "loader", name: "Loader", Showcase: LoaderShowcase },
      {
        id: "progress-bar",
        name: "Progress Bar",
        Showcase: ProgressBarShowcase,
      },
      {
        id: "progress-circle",
        name: "Progress Circle",
        Showcase: ProgressCircleShowcase,
      },
      { id: "meter", name: "Meter", Showcase: MeterShowcase },
      { id: "skeleton", name: "Skeleton", Showcase: SkeletonShowcase },
    ],
  },
  {
    id: "color",
    name: "Color",
    entries: [
      {
        id: "color-picker",
        name: "Color Picker",
        Showcase: ColorPickerShowcase,
      },
      { id: "color-field", name: "Color Field", Showcase: ColorFieldShowcase },
      { id: "color-area", name: "Color Area", Showcase: ColorAreaShowcase },
      {
        id: "color-slider",
        name: "Color Slider",
        Showcase: ColorSliderShowcase,
      },
      {
        id: "color-swatch",
        name: "Color Swatch",
        Showcase: ColorSwatchShowcase,
      },
      {
        id: "color-swatch-picker",
        name: "Color Swatch Picker",
        Showcase: ColorSwatchPickerShowcase,
      },
      { id: "color-thumb", name: "Color Thumb", Showcase: ColorThumbShowcase },
      { id: "color-wheel", name: "Color Wheel", Showcase: ColorWheelShowcase },
    ],
  },
  {
    id: "charts",
    name: "Charts",
    entries: [
      { id: "area-chart", name: "Area Chart", Showcase: AreaChartShowcase },
      { id: "bar-chart", name: "Bar Chart", Showcase: BarChartShowcase },
      { id: "line-chart", name: "Line Chart", Showcase: LineChartShowcase },
      { id: "pie-chart", name: "Pie Chart", Showcase: PieChartShowcase },
    ],
  },
];

/** Flat list of every entry id, in page order (used to seed the scroll spy). */
export const entryIds: string[] = categories.flatMap((category) =>
  category.entries.map((entry) => entry.id)
);
