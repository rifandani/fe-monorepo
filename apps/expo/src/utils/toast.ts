import type { CustomData } from "@tamagui/toast";
import { Option, Schema } from "effect";

const toastPresetSchema = Schema.Literals([
  "default",
  "success",
  "error",
  "warning",
  "info",
]);

export type ToastPreset = typeof toastPresetSchema.Type;

/**
 * this will affect the toast theme and icon
 */
export interface ToastCustomData {
  preset: ToastPreset;
}

const decodeToastPreset = Schema.decodeUnknownOption(toastPresetSchema);

/**
 * Narrow the untyped `customData` bag Tamagui hands back on a toast into a
 * preset we have both a theme and an icon for. Anything unrecognised — a
 * missing bag, or a preset added by a caller that skipped the type — falls
 * back to `default` rather than rendering an unthemed toast.
 */
export const resolveToastPreset = (
  customData?: CustomData | null
): ToastPreset =>
  decodeToastPreset(customData?.preset).pipe(
    Option.getOrElse((): ToastPreset => "default")
  );
