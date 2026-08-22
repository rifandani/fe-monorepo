export type Theme = "system" | "light" | "dark";
export const themes: Theme[] = ["system", "light", "dark"];
// object version of `themes`
export const modes = {
  system: "system",
  light: "light",
  dark: "dark",
} satisfies Record<Theme, Theme>;
export const kilobyteMultiplier = 1024;
export const megabyteMultiplier = kilobyteMultiplier * 1024;
export const gigabyteMultiplier = megabyteMultiplier * 1024;
export const indoTimezone = ["WIB", "WITA", "WIT"] as const;
