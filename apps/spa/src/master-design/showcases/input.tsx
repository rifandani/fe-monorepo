import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

import { Input, InputGroup, Label, TextField } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const InputShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TextField className="w-64">
        <Label>Email</Label>
        <Input placeholder="you@example.com" type="email" />
      </TextField>
    </Variant>

    <Variant label="InputGroup">
      <TextField className="w-64">
        <Label>Search</Label>
        <InputGroup>
          <MagnifyingGlassIcon data-slot="icon" />
          <Input placeholder="Find something…" />
        </InputGroup>
      </TextField>
    </Variant>

    <Variant label="isDisabled">
      <TextField className="w-64" isDisabled>
        <Label>Email</Label>
        <Input defaultValue="you@example.com" />
      </TextField>
    </Variant>
  </VariantGrid>
);
