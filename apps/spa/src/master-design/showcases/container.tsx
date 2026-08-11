import { Container } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const ContainerShowcase = () => (
  <VariantGrid>
    <Variant className="w-full" label="default">
      <Container className="rounded-lg border bg-muted py-3 text-sm">
        Default padding
      </Container>
    </Variant>
    <Variant className="w-full" label="constrained">
      <Container
        className="rounded-lg border bg-muted py-3 text-sm"
        constrained
      >
        Constrained padding
      </Container>
    </Variant>
  </VariantGrid>
);
