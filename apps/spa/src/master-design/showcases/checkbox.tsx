import {
  Checkbox,
  CheckboxField,
  CheckboxGroup,
} from "@/core/components/ui/checkbox";
import { Description } from "@/core/components/ui/field";

import { Variant, VariantGrid } from "../variant";

export const CheckboxShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <CheckboxField>
        <Checkbox>Accept terms</Checkbox>
      </CheckboxField>
    </Variant>

    <Variant label="selected">
      <CheckboxField defaultSelected>
        <Checkbox>Subscribe</Checkbox>
      </CheckboxField>
    </Variant>

    <Variant label="isDisabled">
      <CheckboxField isDisabled>
        <Checkbox>Unavailable</Checkbox>
      </CheckboxField>
    </Variant>

    <Variant label="CheckboxField">
      <CheckboxField defaultSelected>
        <Checkbox>Marketing emails</Checkbox>
        <Description>Occasional product updates.</Description>
      </CheckboxField>
    </Variant>

    <Variant label="CheckboxGroup">
      <CheckboxGroup defaultValue={["billing"]}>
        <CheckboxField value="analytics">
          <Checkbox>Analytics</Checkbox>
        </CheckboxField>
        <CheckboxField value="billing">
          <Checkbox>Billing</Checkbox>
        </CheckboxField>
        <CheckboxField isDisabled value="legacy">
          <Checkbox>Legacy</Checkbox>
        </CheckboxField>
      </CheckboxGroup>
    </Variant>
  </VariantGrid>
);
