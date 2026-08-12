import { Note } from "@/core/components/ui/note";

import { Variant, VariantGrid } from "../variant";

const intents = ["default", "info", "warning", "danger", "success"] as const;

export const NoteShowcase = () => (
  <VariantGrid>
    {intents.map((intent) => (
      <Variant className="w-64" key={intent} label={intent}>
        <Note intent={intent}>{intent} note</Note>
      </Variant>
    ))}
  </VariantGrid>
);
