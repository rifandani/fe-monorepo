import {
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";

import { Variant, VariantGrid } from "../variant";

export const FieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Fieldset className="w-64">
        <Legend>Profile</Legend>
        <Description>Public details for your account.</Description>
        <FieldGroup>
          <TextField>
            <Label>Name</Label>
            <Input defaultValue="Ava Thompson" />
            <Description>Shown on your profile.</Description>
          </TextField>
        </FieldGroup>
      </Fieldset>
    </Variant>

    <Variant label="FieldError">
      <TextField className="w-64" isInvalid>
        <Label>Email</Label>
        <Input defaultValue="not-an-email" />
        <FieldError>Please enter a valid email.</FieldError>
      </TextField>
    </Variant>
  </VariantGrid>
);
