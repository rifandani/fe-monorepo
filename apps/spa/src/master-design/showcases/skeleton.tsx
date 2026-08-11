import { Skeleton } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

const Sample = () => (
  <div>
    <div>
      <p className="text-sm">Ava Thompson</p>
    </div>
  </div>
);

export const SkeletonShowcase = () => (
  <VariantGrid>
    <Variant label="isLoading">
      <Skeleton isLoading>
        <Sample />
      </Skeleton>
    </Variant>
    <Variant label="loaded">
      <Skeleton>
        <Sample />
      </Skeleton>
    </Variant>
  </VariantGrid>
);
