import { Container } from "@/core/components/ui/container";

import { Variant, VariantGrid } from "../variant";

export const ContainerShowcase = () => (
  <VariantGrid>
    <Variant className="w-full" label="default">
      <Container className="bg-muted rounded-lg border py-3 text-sm">
        Default padding
      </Container>
    </Variant>
    <Variant className="w-full" label="constrained">
      <Container
        className="bg-muted rounded-lg border py-3 text-sm"
        constrained
      >
        Constrained padding
      </Container>
    </Variant>
  </VariantGrid>
);
