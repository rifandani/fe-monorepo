import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const DisclosureGroupShowcase = () => (
  <VariantGrid>
    <Variant className="w-72" label="default">
      <DisclosureGroup>
        <Disclosure id="shipping">
          <DisclosureTrigger>Shipping</DisclosureTrigger>
          <DisclosurePanel>Delivered in 2–4 business days.</DisclosurePanel>
        </Disclosure>
        <Disclosure id="returns">
          <DisclosureTrigger>Returns</DisclosureTrigger>
          <DisclosurePanel>Free returns within 30 days.</DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </Variant>
  </VariantGrid>
);
