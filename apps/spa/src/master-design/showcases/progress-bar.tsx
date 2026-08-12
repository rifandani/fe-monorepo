import {
  ProgressBar,
  ProgressBarHeader,
  ProgressBarTrack,
  ProgressBarValue,
} from "@/core/components/ui/progress-bar";

import { Variant, VariantGrid } from "../variant";

export const ProgressBarShowcase = () => (
  <VariantGrid>
    <Variant className="w-56" label="value 40">
      <ProgressBar aria-label="Upload" className="w-56" value={40}>
        <ProgressBarHeader>
          <span>Uploading</span>
          <ProgressBarValue />
        </ProgressBarHeader>
        <ProgressBarTrack />
      </ProgressBar>
    </Variant>
  </VariantGrid>
);
