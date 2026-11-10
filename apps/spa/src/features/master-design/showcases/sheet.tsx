import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetBody,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Variant, VariantGrid } from "../variant";

export const SheetShowcase = () => (
  <VariantGrid>
    <Variant label="right">
      <SheetTrigger>
        <Button intent="outline">Open right</Button>
        <Sheet position="right">
          <SheetHeader>
            <SheetTitle>Right sheet</SheetTitle>
            <SheetDescription>Opens from the right edge.</SheetDescription>
          </SheetHeader>
          <SheetBody>Slide-over panel from the right.</SheetBody>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>
    </Variant>

    <Variant label="left">
      <SheetTrigger>
        <Button intent="outline">Open left</Button>
        <Sheet position="left">
          <SheetHeader>
            <SheetTitle>Left sheet</SheetTitle>
            <SheetDescription>Opens from the left edge.</SheetDescription>
          </SheetHeader>
          <SheetBody>Useful for navigation or filters.</SheetBody>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </Sheet>
      </SheetTrigger>
    </Variant>
  </VariantGrid>
);
