/* oxlint-disable eslint/func-style -- function declarations */
import Feather from "@expo/vector-icons/Feather";
import type { ComponentPropsWithoutRef } from "react";
import { ListItem } from "tamagui";

export function ProfileListItem(
  props: ComponentPropsWithoutRef<typeof ListItem>
) {
  return (
    <ListItem
      hoverTheme
      pressTheme
      transparent
      iconAfter={<Feather name="chevron-right" />}
      pressStyle={{
        bg: "$accent12",
        radiused: true,
      }}
      {...props}
    />
  );
}
