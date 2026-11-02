'use client'

import { PreviewTrigger as PreviewTriggerPrimitive } from "react-aria-components/PreviewTrigger"
import { Popover, type PopoverProps } from "@/core/components/ui/popover"
import { cx } from "@/core/utils/primitive"

export const PreviewTrigger = PreviewTriggerPrimitive
export function Preview({ className, ...props }: PopoverProps) {
  return <Popover className={cx("p-4 max-w-xs", className)} {...props} />
}
