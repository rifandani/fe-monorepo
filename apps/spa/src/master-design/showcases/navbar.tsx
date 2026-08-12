import {
  Navbar,
  NavbarItem,
  NavbarProvider,
  NavbarSection,
  NavbarSpacer,
  NavbarStart,
} from "@/core/components/ui/navbar";

import { Variant, VariantGrid } from "../variant";

export const NavbarShowcase = () => (
  <VariantGrid>
    <Variant className="w-full max-w-xl" label="default">
      <NavbarProvider className="overflow-hidden rounded-lg border">
        <Navbar>
          <NavbarStart className="font-semibold text-sm">Acme</NavbarStart>
          <NavbarSection>
            <NavbarItem href="#" isCurrent>
              Home
            </NavbarItem>
            <NavbarItem href="#">Docs</NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
        </Navbar>
      </NavbarProvider>
    </Variant>
  </VariantGrid>
);
