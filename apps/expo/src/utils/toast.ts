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

export interface ToastCustomData {
  preset: ToastPreset;
}

const decodeToastPreset = Schema.decodeUnknownOption(toastPresetSchema);

export const resolveToastPreset = (
  customData?: CustomData | null
): ToastPreset =>
  decodeToastPreset(customData?.preset).pipe(
    Option.getOrElse((): ToastPreset => "default")
  );
