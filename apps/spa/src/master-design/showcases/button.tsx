import { ArrowRightIcon } from "@heroicons/react/16/solid";

import { Button } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

const intents = [
  "primary",
  "secondary",
  "outline",
  "plain",
  "success",
  "warning",
  "danger",
] as const;

const sizes = ["xs", "sm", "md", "lg"] as const;

export const ButtonShowcase = () => (
  <div className="flex flex-col gap-8">
    <VariantGrid>
      {intents.map((intent) => (
        <Variant key={intent} label={intent}>
          <Button intent={intent}>Button</Button>
        </Variant>
      ))}
    </VariantGrid>

    <VariantGrid>
      {sizes.map((size) => (
        <Variant key={size} label={size}>
          <Button size={size}>Button</Button>
        </Variant>
      ))}
    </VariantGrid>

    <VariantGrid>
      <Variant label="with icon">
        <Button>
          Continue
          <ArrowRightIcon />
        </Button>
      </Variant>
      <Variant label="isCircle">
        <Button isCircle>Rounded</Button>
      </Variant>
      <Variant label="isPending">
        <Button isPending>Saving</Button>
      </Variant>
      <Variant label="isDisabled">
        <Button isDisabled>Disabled</Button>
      </Variant>
    </VariantGrid>
  </div>
);
