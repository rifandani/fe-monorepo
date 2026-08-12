import { Label } from "@/core/components/ui/field";
import { SearchField, SearchInput } from "@/core/components/ui/search-field";

import { Variant, VariantGrid } from "../variant";

export const SearchFieldShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <SearchField className="w-56">
        <Label>Search</Label>
        <SearchInput placeholder="Find something…" />
      </SearchField>
    </Variant>

    <Variant label="defaultValue">
      <SearchField className="w-56" defaultValue="monorepo">
        <SearchInput />
      </SearchField>
    </Variant>

    <Variant label="isDisabled">
      <SearchField className="w-56" isDisabled>
        <SearchInput placeholder="Disabled" />
      </SearchField>
    </Variant>
  </VariantGrid>
);
