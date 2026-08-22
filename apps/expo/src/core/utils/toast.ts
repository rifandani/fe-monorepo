/**
 * this will affect the toast theme and icon
 */
export interface ToastCustomData {
  preset: "default" | "success" | "error" | "warning" | "info";
}

export type ToastPreset = ToastCustomData["preset"];

const TOAST_PRESETS = new Set<string>([
  "default",
  "success",
  "error",
  "warning",
  "info",
]);

/**
 * Narrow the untyped `customData` bag Tamagui hands back on a toast into a
 * preset we have both a theme and an icon for. Anything unrecognised — a
 * missing bag, or a preset added by a caller that skipped the type — falls
 * back to `default` rather than rendering an unthemed toast.
 */
export const resolveToastPreset = <T>(customData?: T): ToastPreset => {
  // SAFETY: `preset` is validated against `TOAST_PRESETS` below, and anything
  // else - including a bag without the field - falls back to `default`.
  const preset = (customData as Partial<ToastCustomData> | undefined)?.preset;
  return preset && TOAST_PRESETS.has(preset) ? preset : "default";
};
