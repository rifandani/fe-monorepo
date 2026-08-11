import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const DrawerShowcase = () => (
  <VariantGrid>
    <Variant label="bottom">
      <Drawer>
        <DrawerTrigger>Open bottom</DrawerTrigger>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>Bottom drawer</DrawerTitle>
            <DrawerDescription>Default side is bottom.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Drag down or tap close to dismiss.</DrawerBody>
          <DrawerFooter>
            <DrawerClose>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Variant>

    <Variant label="right">
      <Drawer>
        <DrawerTrigger>Open right</DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>Right drawer</DrawerTitle>
            <DrawerDescription>
              Side panel with drag-to-dismiss.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Use for mobile-style sheets.</DrawerBody>
          <DrawerFooter>
            <DrawerClose>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Variant>
  </VariantGrid>
);
