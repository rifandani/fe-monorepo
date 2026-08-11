import { Code, Strong, Text, TextLink } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const TextShowcase = () => (
  <VariantGrid>
    <Variant label="Text">
      <Text>Muted body copy.</Text>
    </Variant>
    <Variant label="Strong">
      <Text>
        <Strong>Emphasized</Strong> phrase.
      </Text>
    </Variant>
    <Variant label="Code">
      <Text>
        Run <Code>pnpm dev</Code>.
      </Text>
    </Variant>
    <Variant label="TextLink">
      <Text>
        See the <TextLink href="https://example.com">docs</TextLink>.
      </Text>
    </Variant>
  </VariantGrid>
);
