"use client";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { ToggleButton } from "react-aria-components/ToggleButton";
import { tv } from "tailwind-variants";

import { buttonStyles } from "@/core/components/ui/button";
import { Text } from "@/core/components/ui/text";

const showMoreStyles = tv({
  base: "text-sm leading-6 before:border-border after:border-border",
  compoundVariants: [
    {
      className:
        "mx-2 flex flex-col items-center before:mb-2 before:flex-1 before:border-l after:mt-2 after:flex-1 after:border-r",
      orientation: "vertical",
    },
    {
      className:
        "my-2 flex items-center self-stretch before:me-2 before:flex-1 before:border-t after:ms-2 after:flex-1 after:border-t",
      orientation: "horizontal",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
  },
  variants: {
    orientation: {
      horizontal: "my-0.5 h-px w-full self-stretch",
      vertical: "mx-1 h-auto self-stretch",
    },
  },
});
interface ShowMoreProps extends Omit<
  React.ComponentProps<typeof ToggleButton>,
  "className"
> {
  className?: string;
  orientation?: "horizontal" | "vertical";
  as?: "text" | "button";
  text?: string;
}
const ShowMore = ({
  as = "button",
  orientation = "horizontal",
  className,
  ...props
}: ShowMoreProps) => (
  <div className={showMoreStyles({ className, orientation })}>
    {as === "button" ? (
      <ToggleButton
        {...props}
        className={buttonStyles({
          intent: "outline",
          isCircle: true,
          size: "sm",
        })}
      >
        {composeRenderProps(props.children, (children) => children)}
      </ToggleButton>
    ) : (
      <Text>{props.text}</Text>
    )}
  </div>
);
export type { ShowMoreProps };
export { ShowMore };
