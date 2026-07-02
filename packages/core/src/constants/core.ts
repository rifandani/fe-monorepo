export type Theme = "system" | "light" | "dark";
export const themes: Theme[] = ["system", "light", "dark"];
export const modes = {} as Record<Theme, Theme>;
for (const item of themes) {
  modes[item] = item;
}
export const kilobyteMultiplier = 1024;
export const megabyteMultiplier = kilobyteMultiplier * 1024;
export const gigabyteMultiplier = megabyteMultiplier * 1024;
export const indoTimezone = ["WIB", "WITA", "WIT"] as const;
