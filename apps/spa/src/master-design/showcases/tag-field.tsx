import { Label } from "@/core/components/ui/field";
import { Input } from "@/core/components/ui/input";
import { TagField } from "@/core/components/ui/tag-field";

import { Variant, VariantGrid } from "../variant";

export const TagFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TagField className="w-64" defaultValue={["react", "aria"]} name="tags">
        <Label>Tags</Label>
        <Input placeholder="Add a tag" />
      </TagField>
    </Variant>

    <Variant label="isDisabled">
      <TagField
        className="w-64"
        defaultValue={["react"]}
        isDisabled
        name="tags-disabled"
      >
        <Label>Tags</Label>
        <Input />
      </TagField>
    </Variant>
  </VariantGrid>
);
