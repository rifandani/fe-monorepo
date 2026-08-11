import { Badge } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

const intents = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "danger",
  "outline",
] as const;

export const BadgeShowcase = () => (
  <div className="flex flex-col gap-8">
    <VariantGrid>
      {intents.map((intent) => (
        <Variant key={intent} label={intent}>
          <Badge intent={intent}>{intent}</Badge>
        </Variant>
      ))}
    </VariantGrid>

    <VariantGrid>
      <Variant label="isCircle">
        <Badge isCircle>Circle</Badge>
      </Variant>
      <Variant label="square">
        <Badge isCircle={false}>Square</Badge>
      </Variant>
    </VariantGrid>
  </div>
);
