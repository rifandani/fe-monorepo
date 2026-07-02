import { Button, styled } from "tamagui";
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
    default: {},
    error: {
      bg: "$red5",
      color: "$red11",
      pressStyle: {
        bg: "$red6",
        borderColor: "$borderColorPress",
      },
    },
    info: {
      bg: "$blue5",
      color: "$blue11",
      pressStyle: {
        bg: "$blue6",
        borderColor: "$borderColorPress",
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
        borderColor: "$borderColorPress",
      },
    },
    primary: {
      bg: "$purple5",
      color: "$purple11",
      pressStyle: {
        bg: "$purple6",
        borderColor: "$borderColorPress",
      },
    },
    secondary: {
      bg: "$pink5",
      color: "$pink11",
      pressStyle: {
        bg: "$pink6",
        borderColor: "$borderColorPress",
      },
    },
    success: {
      bg: "$green5",
      color: "$green11",
      pressStyle: {
        bg: "$green6",
        borderColor: "$borderColorPress",
      },
    },
    warning: {
      bg: "$yellow5",
      color: "$yellow11",
      pressStyle: {
        bg: "$yellow6",
        borderColor: "$borderColorPress",
      },
    },
  },
} as const;
export const BaseButton = styled(Button, {
  defaultVariants: {},
  name: "BaseButton",
});
