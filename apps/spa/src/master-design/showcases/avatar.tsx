import { Avatar } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const AvatarShowcase = () => (
  <VariantGrid>
    <Variant label="sm">
      <Avatar initials="AT" size="sm" />
    </Variant>
    <Variant label="md">
      <Avatar initials="AT" size="md" />
    </Variant>
    <Variant label="lg">
      <Avatar initials="AT" size="lg" />
    </Variant>
    <Variant label="isSquare">
      <Avatar initials="AT" isSquare />
    </Variant>
  </VariantGrid>
);
