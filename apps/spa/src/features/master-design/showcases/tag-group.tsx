import { Label } from "@/components/ui/field";
import { Tag, TagGroup, TagList } from "@/components/ui/tag-group";

import { Variant, VariantGrid } from "../variant";

export const TagGroupShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <TagGroup>
        <Label>Categories</Label>
        <TagList>
          <Tag>React</Tag>
          <Tag>Aria</Tag>
          <Tag>Design</Tag>
        </TagList>
      </TagGroup>
    </Variant>

    <Variant label="selected">
      <TagGroup defaultSelectedKeys={["react"]} selectionMode="multiple">
        <Label>Categories</Label>
        <TagList>
          <Tag id="react">React</Tag>
          <Tag id="aria">Aria</Tag>
          <Tag id="design">Design</Tag>
        </TagList>
      </TagGroup>
    </Variant>

    <Variant label="isDisabled">
      <TagGroup>
        <Label>Categories</Label>
        <TagList>
          <Tag isDisabled>React</Tag>
          <Tag>Aria</Tag>
        </TagList>
      </TagGroup>
    </Variant>
  </VariantGrid>
);
