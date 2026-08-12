import { Button } from "@/core/components/ui/button";
import { ButtonGroup } from "@/core/components/ui/button-group";

import { Variant, VariantGrid } from "../variant";

export const ButtonGroupShowcase = () => (
  <VariantGrid>
    <Variant label="horizontal">
      <ButtonGroup>
        <Button intent="outline">Left</Button>
        <Button intent="outline">Center</Button>
        <Button intent="outline">Right</Button>
      </ButtonGroup>
    </Variant>

    <Variant label="vertical">
      <ButtonGroup orientation="vertical">
        <Button intent="outline">Top</Button>
        <Button intent="outline">Middle</Button>
        <Button intent="outline">Bottom</Button>
      </ButtonGroup>
    </Variant>
  </VariantGrid>
);
