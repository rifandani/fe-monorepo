import { useHead } from "@unhead/react";
import { createHead, UnheadProvider } from "@unhead/react/client";

import { ENV } from "@/core/constants/env";

const head = createHead();
const SchemaOrgHostParams = () => {
  useHead({
    templateParams: {
      schemaOrg: {
        host: ENV.VITE_APP_URL,
      },
    },
  });
  return null;
};
export const AppHeadProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <UnheadProvider head={head}>
    <SchemaOrgHostParams />
    {children}
  </UnheadProvider>
);
