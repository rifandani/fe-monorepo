import type { PropsWithChildren } from "react";
import { Separator, YGroup } from "tamagui";

import { BaseSheet } from "@/core/components/sheet/base-sheet";
import type {
  BaseSheetProps,
  BaseSheetState,
} from "@/core/components/sheet/types";

type FitSheetProps = PropsWithChildren<
  Pick<BaseSheetProps<BaseSheetState>, "state" | "setState">
>;

export const FitSheet = ({ state, setState, children }: FitSheetProps) => (
  <BaseSheet
    state={state}
    setState={setState}
    sheetProps={{ snapPointsMode: "fit" }}
    frameProps={{ p: "$5" }}
  >
    <YGroup verticalAlign="center" bordered separator={<Separator />}>
      {children}
    </YGroup>
  </BaseSheet>
);

FitSheet.Item = YGroup.Item;
