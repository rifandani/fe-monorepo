import { ShowMore } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const ShowMoreShowcase = () => (
  <VariantGrid>
    <Variant className="w-64" label="button">
      <ShowMore>Show more</ShowMore>
    </Variant>

    <Variant className="w-64" label="text">
      <ShowMore as="text" text="Or continue with" />
    </Variant>
  </VariantGrid>
);
