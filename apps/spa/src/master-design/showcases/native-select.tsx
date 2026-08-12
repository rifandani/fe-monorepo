import { Label } from "@/core/components/ui/field";
import {
  NativeSelect,
  NativeSelectContent,
} from "@/core/components/ui/native-select";

import { Variant, VariantGrid } from "../variant";

export const NativeSelectShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <NativeSelect className="w-56">
        <Label>Fruit</Label>
        <NativeSelectContent defaultValue="apple">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </NativeSelectContent>
      </NativeSelect>
    </Variant>

    <Variant label="isInvalid">
      <NativeSelect className="w-56">
        <Label>Fruit</Label>
        <NativeSelectContent isInvalid>
          <option value="">Pick one…</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </NativeSelectContent>
      </NativeSelect>
    </Variant>

    <Variant label="disabled">
      <NativeSelect className="w-56">
        <Label>Fruit</Label>
        <NativeSelectContent defaultValue="banana" disabled>
          <option value="banana">Banana</option>
        </NativeSelectContent>
      </NativeSelect>
    </Variant>
  </VariantGrid>
);
