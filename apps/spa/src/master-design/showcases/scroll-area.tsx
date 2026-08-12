import { ScrollArea } from "@/core/components/ui/scroll-area";

import { Variant, VariantGrid } from "../variant";

const lines = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliet",
];

export const ScrollAreaShowcase = () => (
  <VariantGrid>
    <Variant label="vertical">
      <ScrollArea
        className="h-32 w-56 rounded-lg border"
        orientation="vertical"
      >
        <div className="space-y-2 p-3 text-sm">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </ScrollArea>
    </Variant>
  </VariantGrid>
);
