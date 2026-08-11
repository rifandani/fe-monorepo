import {
  Button,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const SheetShowcase = () => (
  <VariantGrid>
    <Variant label="right">
      <Sheet>
        <Button intent="outline">Open right</Button>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Right sheet</SheetTitle>
            <SheetDescription>Default side is right.</SheetDescription>
          </SheetHeader>
          <SheetBody>Slide-over panel from the right.</SheetBody>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Variant>

    <Variant label="left">
      <Sheet>
        <Button intent="outline">Open left</Button>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left sheet</SheetTitle>
            <SheetDescription>Opens from the left edge.</SheetDescription>
          </SheetHeader>
          <SheetBody>Useful for navigation or filters.</SheetBody>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Variant>
  </VariantGrid>
);
