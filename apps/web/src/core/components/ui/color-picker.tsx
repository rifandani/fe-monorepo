"use client";
import { EyeDropperIcon } from "@heroicons/react/24/solid";
import { use } from "react";
import type { ColorPickerProps as ColorPickerPrimitiveProps } from "react-aria-components/ColorPicker";
import {
  ColorPicker as ColorPickerPrimitive,
  ColorPickerStateContext,
} from "react-aria-components/ColorPicker";
import { parseColor } from "react-stately";
import { twMerge } from "tailwind-merge";

import { Button } from "./button";
import { fieldStyles } from "./field";

interface ColorPickerProps extends ColorPickerPrimitiveProps {
  className?: string;
}
const ColorPicker = ({ className, ...props }: ColorPickerProps) => (
  <div
    data-slot="control"
    className={twMerge(fieldStyles({ className: "w-fit" }), className)}
  >
    <ColorPickerPrimitive {...props} />
  </div>
);
declare global {
  interface Window {
    EyeDropper?: new () => {
      open: () => Promise<{
        sRGBHex: string;
      }>;
    };
  }
}
const EyeDropper = () => {
  const state = use(ColorPickerStateContext);
  if (!state) {
    return null;
  }
  if (!window.EyeDropper) {
    return "EyeDropper is not supported in your browser.";
  }
  return (
    <Button
      className="shrink-0"
      aria-label="Eye dropper"
      size="sq-md"
      intent="outline"
      onPress={async () => {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        state.setColor(parseColor(result.sRGBHex));
      }}
    >
      <EyeDropperIcon />
    </Button>
  );
};
export type { ColorPickerProps };
export { ColorPicker, EyeDropper };
