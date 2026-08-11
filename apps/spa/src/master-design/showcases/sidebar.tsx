import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarItem,
  SidebarLabel,
  SidebarProvider,
  SidebarSection,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const SidebarShowcase = () => (
  <VariantGrid>
    <Variant className="w-full max-w-xl" label="defaultOpen">
      <SidebarProvider
        className="h-64 overflow-hidden rounded-lg border"
        defaultOpen
      >
        <Sidebar collapsible="none">
          <SidebarHeader className="font-semibold text-sm">Acme</SidebarHeader>
          <SidebarContent>
            <SidebarSection label="Nav">
              <SidebarItem href="#" isCurrent>
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 text-muted-fg text-sm">Inset content</div>
        </SidebarInset>
      </SidebarProvider>
    </Variant>
  </VariantGrid>
);
