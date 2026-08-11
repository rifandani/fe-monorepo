import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const TabsShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <Tabs>
        <TabList>
          <Tab id="overview">Overview</Tab>
          <Tab id="analytics">Analytics</Tab>
          <Tab id="reports">Reports</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="overview">Overview content</TabPanel>
          <TabPanel id="analytics">Analytics content</TabPanel>
          <TabPanel id="reports">Reports content</TabPanel>
        </TabPanels>
      </Tabs>
    </Variant>
  </VariantGrid>
);
