import { Button, styled } from "tamagui";

const BORDER_COLOR_PRESS = "$borderColorPress";
/**
 * includes `bg`, `color`, `pressStyle.bg`, `pressStyle.borderColor`
 */
const _baseButtonVariants = {
  disabled: {
    true: {
      bc: "$borderColor",
      bg: "$background",
      color: "$color",
      pointerEvents: "none",
    },
  },
  preset: {
    default: {}, // unstyled
    error: {
      bg: "$red5",
      color: "$red11",
      pressStyle: {
        bg: "$red6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    info: {
      bg: "$blue5",
      color: "$blue11",
      pressStyle: {
        bg: "$blue6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    outlined: {
      backgroundColor: "transparent",
      borderColor: "$borderColor",
      borderWidth: 2,
      focusStyle: {
        backgroundColor: "transparent",
        borderColor: "$borderColorFocus",
      },
      hoverStyle: {
        backgroundColor: "transparent",
        borderColor: "$borderColorHover",
      },
      pressStyle: {
        backgroundColor: "transparent",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    primary: {
      bg: "$purple5",
      color: "$purple11",
      pressStyle: {
        bg: "$purple6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    secondary: {
      bg: "$pink5",
      color: "$pink11",
      pressStyle: {
        bg: "$pink6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    success: {
      bg: "$green5",
      color: "$green11",
      pressStyle: {
        bg: "$green6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
    warning: {
      bg: "$yellow5",
      color: "$yellow11",
      pressStyle: {
        bg: "$yellow6",
        borderColor: BORDER_COLOR_PRESS,
      },
    },
  },
} as const;
export const BaseButton = styled(Button, {
  name: "BaseButton",
  // variants: baseButtonVariants,
  defaultVariants: {},
});
