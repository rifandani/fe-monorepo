import { Tree, TreeContent, TreeItem } from "@/core/components/ui/tree";

import { Variant, VariantGrid } from "../variant";

export const TreeShowcase = () => (
  <VariantGrid>
    <Variant label="nested">
      <Tree
        aria-label="Files"
        className="w-64 rounded-lg border p-1"
        defaultExpandedKeys={["docs"]}
      >
        <TreeItem id="docs" textValue="Documents">
          <TreeContent>Documents</TreeContent>
          <TreeItem id="report" textValue="Report.pdf">
            <TreeContent>Report.pdf</TreeContent>
          </TreeItem>
        </TreeItem>
      </Tree>
    </Variant>
  </VariantGrid>
);
