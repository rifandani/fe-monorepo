import {
  Snippet,
  SnippetTab,
  SnippetTabPanel,
  SnippetTabPanels,
  SnippetTabsList,
} from "@/core/components/ui/snippet";

import { Variant, VariantGrid } from "../variant";

export const SnippetShowcase = () => (
  <VariantGrid>
    <Variant className="w-full max-w-md" label="tabs">
      <Snippet defaultSelectedKey="ts">
        <SnippetTabsList>
          <SnippetTab id="ts">TypeScript</SnippetTab>
          <SnippetTab id="js">JavaScript</SnippetTab>
        </SnippetTabsList>
        <SnippetTabPanels>
          <SnippetTabPanel id="ts">
            {'const greet = (name: string) => "hi";'}
          </SnippetTabPanel>
          <SnippetTabPanel id="js">
            {'const greet = (name) => "hi";'}
          </SnippetTabPanel>
        </SnippetTabPanels>
      </Snippet>
    </Variant>
  </VariantGrid>
);
