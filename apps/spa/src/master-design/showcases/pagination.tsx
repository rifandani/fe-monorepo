import {
  Pagination,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@/core/components/ui/pagination";

import { Variant, VariantGrid } from "../variant";

export const PaginationShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Pagination>
        <PaginationList>
          <PaginationPrevious href="#" />
          <PaginationItem href="#">1</PaginationItem>
          <PaginationItem href="#" isCurrent>
            2
          </PaginationItem>
          <PaginationItem href="#">3</PaginationItem>
          <PaginationNext href="#" />
        </PaginationList>
      </Pagination>
    </Variant>
  </VariantGrid>
);
