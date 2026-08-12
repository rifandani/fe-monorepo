import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/core/components/ui/description-list";

import { Variant, VariantGrid } from "../variant";

export const DescriptionListShowcase = () => (
  <VariantGrid>
    <Variant className="w-full max-w-md" label="default">
      <DescriptionList>
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetails>Ava Thompson</DescriptionDetails>
        <DescriptionTerm>Role</DescriptionTerm>
        <DescriptionDetails>Admin</DescriptionDetails>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>Active</DescriptionDetails>
      </DescriptionList>
    </Variant>
  </VariantGrid>
);
