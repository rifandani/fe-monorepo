import {
  ChoiceBox,
  ChoiceBoxDescription,
  ChoiceBoxItem,
  ChoiceBoxLabel,
} from "@/core/components/ui/choice-box";

import { Variant, VariantGrid } from "../variant";

export const ChoiceBoxShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <ChoiceBox
        aria-label="Plan"
        className="w-72"
        defaultSelectedKeys={["starter"]}
      >
        <ChoiceBoxItem id="starter">
          <ChoiceBoxLabel>Starter</ChoiceBoxLabel>
          <ChoiceBoxDescription>For individuals.</ChoiceBoxDescription>
        </ChoiceBoxItem>
        <ChoiceBoxItem id="pro">
          <ChoiceBoxLabel>Pro</ChoiceBoxLabel>
          <ChoiceBoxDescription>For growing teams.</ChoiceBoxDescription>
        </ChoiceBoxItem>
      </ChoiceBox>
    </Variant>

    <Variant label="isDisabled">
      <ChoiceBox
        aria-label="Plan"
        className="w-72"
        defaultSelectedKeys={["starter"]}
      >
        <ChoiceBoxItem id="starter">
          <ChoiceBoxLabel>Starter</ChoiceBoxLabel>
          <ChoiceBoxDescription>For individuals.</ChoiceBoxDescription>
        </ChoiceBoxItem>
        <ChoiceBoxItem id="enterprise" isDisabled>
          <ChoiceBoxLabel>Enterprise</ChoiceBoxLabel>
          <ChoiceBoxDescription>Contact sales.</ChoiceBoxDescription>
        </ChoiceBoxItem>
      </ChoiceBox>
    </Variant>
  </VariantGrid>
);
