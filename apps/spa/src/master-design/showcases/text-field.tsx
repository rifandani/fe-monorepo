import {
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const TextFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TextField className="w-64">
        <Label>Email</Label>
        <Input placeholder="you@example.com" type="email" />
      </TextField>
    </Variant>

    <Variant label="description">
      <TextField className="w-64">
        <Label>Username</Label>
        <Input placeholder="rifandani" />
        <Description>This will be your public handle.</Description>
      </TextField>
    </Variant>

    <Variant label="isInvalid">
      <TextField className="w-64" isInvalid>
        <Label>Email</Label>
        <Input defaultValue="not-an-email" />
        <FieldError>Please enter a valid email.</FieldError>
      </TextField>
    </Variant>

    <Variant label="isDisabled">
      <TextField className="w-64" isDisabled>
        <Label>Email</Label>
        <Input placeholder="you@example.com" />
      </TextField>
    </Variant>
  </VariantGrid>
);
