import { Label } from "@/core/components/ui/field";
import { TextField } from "@/core/components/ui/text-field";
import { Textarea } from "@/core/components/ui/textarea";

import { Variant, VariantGrid } from "../variant";

export const TextareaShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TextField className="w-64">
        <Label>Bio</Label>
        <Textarea placeholder="Tell us about yourself" />
      </TextField>
    </Variant>

    <Variant label="isInvalid">
      <TextField className="w-64" isInvalid>
        <Label>Bio</Label>
        <Textarea defaultValue="Too short" />
      </TextField>
    </Variant>

    <Variant label="isDisabled">
      <TextField className="w-64" isDisabled>
        <Label>Bio</Label>
        <Textarea defaultValue="Cannot edit" />
      </TextField>
    </Variant>
  </VariantGrid>
);
