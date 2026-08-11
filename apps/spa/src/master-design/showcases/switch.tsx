import { Switch, SwitchField } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const SwitchShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <SwitchField>
        <Switch>Airplane mode</Switch>
      </SwitchField>
    </Variant>

    <Variant label="selected">
      <SwitchField defaultSelected>
        <Switch>Notifications</Switch>
      </SwitchField>
    </Variant>

    <Variant label="isDisabled">
      <SwitchField isDisabled>
        <Switch>Unavailable</Switch>
      </SwitchField>
    </Variant>
  </VariantGrid>
);
