"use client";

import { useState } from "react";

import { Button } from "@/core/components/ui/button";
import {
  CommandMenu,
  CommandMenuItem,
  CommandMenuLabel,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
} from "@/core/components/ui/command-menu";

import { Variant, VariantGrid } from "../variant";

export const CommandMenuShowcase = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <VariantGrid>
      <Variant label="default">
        <Button intent="outline" onPress={() => setIsOpen(true)}>
          Open
        </Button>
        <CommandMenu isOpen={isOpen} onOpenChange={setIsOpen}>
          <CommandMenuSearch placeholder="Search…" />
          <CommandMenuList>
            <CommandMenuSection label="Pages">
              <CommandMenuItem textValue="Home">
                <CommandMenuLabel>Home</CommandMenuLabel>
              </CommandMenuItem>
              <CommandMenuItem textValue="Settings">
                <CommandMenuLabel>Settings</CommandMenuLabel>
              </CommandMenuItem>
            </CommandMenuSection>
          </CommandMenuList>
        </CommandMenu>
      </Variant>
    </VariantGrid>
  );
};
