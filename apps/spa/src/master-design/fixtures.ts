import type { ChartConfig } from "@/core/components/ui/chart";

/**
 * Deterministic sample data shared across data-driven showcases. Hand-written
 * constants (no faker) so the catalog renders identically on every reload,
 * which keeps it useful for eyeballing visual regressions.
 */

export const revenueData = [
  { month: "Jan", Revenue: 4200, Expenses: 2400 },
  { month: "Feb", Revenue: 4600, Expenses: 2210 },
  { month: "Mar", Revenue: 5100, Expenses: 2290 },
  { month: "Apr", Revenue: 4780, Expenses: 2000 },
  { month: "May", Revenue: 5890, Expenses: 2181 },
  { month: "Jun", Revenue: 6390, Expenses: 2500 },
  { month: "Jul", Revenue: 7490, Expenses: 2100 },
];

export const revenueConfig = {
  Revenue: { label: "Revenue" },
  Expenses: { label: "Expenses" },
} satisfies ChartConfig;

export const shareData = [
  { name: "Chrome", value: 275 },
  { name: "Safari", value: 200 },
  { name: "Firefox", value: 187 },
  { name: "Edge", value: 173 },
  { name: "Other", value: 90 },
];

/** HSL so hue-channel color widgets don't throw (`Unknown color channel: hue` on RGB hex). */
export const brandHsl = "hsl(216, 98%, 52%)";

export const shareConfig = {
  Chrome: { label: "Chrome" },
  Safari: { label: "Safari" },
  Firefox: { label: "Firefox" },
  Edge: { label: "Edge" },
  Other: { label: "Other" },
} satisfies ChartConfig;

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited" | "Suspended";
}

export const demoUsers: DemoUser[] = [
  {
    id: 1,
    name: "Ava Thompson",
    email: "ava@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Liam Chen",
    email: "liam@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 3,
    name: "Noah Patel",
    email: "noah@example.com",
    role: "Viewer",
    status: "Invited",
  },
  {
    id: 4,
    name: "Mia Rodriguez",
    email: "mia@example.com",
    role: "Editor",
    status: "Suspended",
  },
];
